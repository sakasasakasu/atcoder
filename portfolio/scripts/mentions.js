/**
 * `[[対象ID]]` 形式の言及（メンション）を処理する共有モジュール。
 *
 * - 問題 ID: `ABC471-A` / `典型-002`（コンテストID-問題ID）
 * - 解法 ID: ファイル名（例: ダイクストラ法）
 *
 * 生成時のみ使用し、`.md` 自体は編集しない。
 * 未解決の言及はそのまま残し、`unresolved` として報告する。
 */

// next.config.ts の basePath と一致させること。
// 相対リンクだと http://localhost:3000/atcoder（末尾スラッシュなし）からの解決がずれるため、
// ページをまたぐ言及リンクは basePath 込みの絶対パスにする。
const BASE_PATH = "/atcoder"

/** 言及トークンのパターン: [[対象ID]] */
const MENTION_PATTERN = /\[\[([^\[\]]+)\]\]/g

/** コードスパン（`...`）とコードブロック（```...``` / ~~~...~~~）のパターン */
const MENTION_CODE_PATTERN = /```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`/g

/**
 * 本文を「コード部分」と「それ以外」に分割する（コード内の言及を変換しないため）
 * @param {string} content
 * @returns {{ code: boolean; text: string }[]}
 */
function splitCodeAndText(content) {
  const segments = []
  let lastIndex = 0
  for (const match of content.matchAll(MENTION_CODE_PATTERN)) {
    if (match.index > lastIndex) {
      segments.push({ code: false, text: content.slice(lastIndex, match.index) })
    }
    segments.push({ code: true, text: match[0] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) {
    segments.push({ code: false, text: content.slice(lastIndex) })
  }
  return segments
}

/**
 * 文字列中の [[id]] 形式の言及を抽出する（重複なし・出現順）
 * @param {string} content
 * @returns {string[]}
 */
function extractMentionIds(content) {
  const ids = []
  const seen = new Set()
  for (const match of content.matchAll(MENTION_PATTERN)) {
    const id = match[1].trim()
    if (id !== "" && !seen.has(id)) {
      seen.add(id)
      ids.push(id)
    }
  }
  return ids
}

/**
 * 問題一覧から「問題ID → 表示情報」のマップを構築する
 * @param {import("./main").Contest[]} contests
 * @returns {Map<string, { label: string; anchor: string }>}
 */
function buildProblemIndex(contests) {
  const map = new Map()
  for (const contest of contests) {
    for (const problem of contest.problems) {
      const id = `${contest.abc}-${problem.id}`
      // 典型形式（flat）は title にセクション名が含まれるため title をそのまま使う
      const label = contest.flat ? problem.title : `${contest.abc} ${problem.title}`
      map.set(id, { label, anchor: id })
    }
  }
  return map
}

/**
 * 解法一覧（カテゴリ配下）から「解法ID → 表示情報」のマップを構築する。
 * 解法 ID はファイル名で、カテゴリをまたいで一意である前提
 * @param {import("./solutions").SolutionCategory[]} categories
 * @returns {Map<string, { label: string; anchor: string }>}
 */
function buildSolutionIndex(categories) {
  const map = new Map()
  for (const category of categories) {
    for (const solution of category.items) {
      map.set(solution.id, { label: solution.title, anchor: solution.id })
    }
  }
  return map
}

/**
 * 言及 ID を解決して参照情報（ラベル・href）を返す。
 * ページをまたぐリンクは basePath 込みの絶対パス、同一ページ内はアンカーのみ。
 * @param {string} id
 * @param {{ problems: Map<string, { label: string; anchor: string }>, solutions: Map<string, { label: string; anchor: string }> }} index
 * @param {"problem" | "solution"} sourceKind 言及が表示されるページ種別
 * @returns {{ id: string; label: string; href: string } | null}
 */
function resolveMention(id, index, sourceKind) {
  if (index.problems.has(id)) {
    const { label, anchor } = index.problems.get(id)
    // 解法ページから問題（ホームページ）へは絶対パス、同一ページ内はアンカー
    const href = sourceKind === "solution" ? `${BASE_PATH}/#${anchor}` : `#${anchor}`
    return { id, label, href }
  }
  if (index.solutions.has(id)) {
    const { label, anchor } = index.solutions.get(id)
    // ホームページから解法ページへは絶対パス、同一ページ内はアンカー
    const href = sourceKind === "solution" ? `#${anchor}` : `${BASE_PATH}/solution#${anchor}`
    return { id, label, href }
  }
  return null
}

/**
 * 参照情報を対象 ID で重複排除する（出現順を維持）
 * @param {{ id: string; label: string; href: string }[]} refs
 * @returns {{ id: string; label: string; href: string }[]}
 */
function dedupeRefs(refs) {
  const seen = new Set()
  return refs.filter((ref) => {
    if (seen.has(ref.id)) return false
    seen.add(ref.id)
    return true
  })
}

/**
 * content 内の [[id]] を markdown リンクに書き換える。
 * 未解決の言及はそのまま残す。
 * @param {string} content
 * @param {{ problems: Map, solutions: Map }} index
 * @param {"problem" | "solution"} sourceKind
 * @returns {{ content: string; mentions: { id: string; label: string; href: string }[]; unresolved: string[] }}
 */
function resolveMentionsInContent(content, index, sourceKind) {
  const mentions = []
  const unresolved = []
  const rewritten = splitCodeAndText(content)
    .map((segment) => {
      if (segment.code) return segment.text
      return segment.text.replace(MENTION_PATTERN, (whole, rawId) => {
        const id = rawId.trim()
        const ref = resolveMention(id, index, sourceKind)
        if (ref) {
          mentions.push(ref)
          return `[${ref.label}](${ref.href})`
        }
        unresolved.push(id)
        return whole
      })
    })
    .join("")
  return { content: rewritten, mentions: dedupeRefs(mentions), unresolved }
}

/**
 * 全言及（問題→対象 / 解法→対象）から、対象 ID ごとの参照一覧（バックリンク）を集計する。
 * バックリンクは表示先ページ（sourceKind）基準で、言及元へのリンクとして再解決する。
 * @param {import("./main").Contest[]} contests
 * @param {import("./solutions").SolutionCategory[]} solutions
 * @param {{ problems: Map, solutions: Map }} index
 * @param {"problem" | "solution"} sourceKind
 * @returns {Map<string, { id: string; label: string; href: string }[]>}
 */
function collectBacklinks(contests, solutions, index, sourceKind) {
  const backlinks = new Map()
  const addBacklink = (targetId, sourceRef) => {
    if (!backlinks.has(targetId)) backlinks.set(targetId, [])
    const list = backlinks.get(targetId)
    if (!list.some((existing) => existing.id === sourceRef.id)) list.push(sourceRef)
  }

  // 解法が言及している対象 → 対象側に「この解法が言及している」タグ
  for (const category of solutions) {
    for (const solution of category.items) {
      const sourceRef = resolveMention(solution.id, index, sourceKind)
      if (!sourceRef) continue
      for (const mention of solution.mentions) {
        addBacklink(mention.id, sourceRef)
      }
    }
  }

  // 問題が言及している対象 → 対象側に「この問題が言及している」タグ
  for (const contest of contests) {
    for (const problem of contest.problems) {
      const problemId = `${contest.abc}-${problem.id}`
      const sourceRef = resolveMention(problemId, index, sourceKind)
      if (!sourceRef) continue
      for (const mention of problem.mentions) {
        addBacklink(mention.id, sourceRef)
      }
    }
  }
  return backlinks
}

/**
 * 問題と解法の相互参照（前方リンク + バックリンクタグ）を計算し、各オブジェクトを書き換える。
 * `.md` は編集せず、返り値の content だけをリンク済みに変換する。
 * @param {import("./main").Contest[]} contests
 * @param {import("./solutions").SolutionCategory[]} solutions
 * @returns {{ contests: import("./main").Contest[], solutions: import("./solutions").SolutionCategory[], unresolved: string[] }}
 */
function applyCrossReferences(contests, solutions) {
  const index = {
    problems: buildProblemIndex(contests),
    solutions: buildSolutionIndex(solutions),
  }
  const unresolved = []

  // 問題側: content の [[...]] を解決（ホームページ表示）
  for (const contest of contests) {
    for (const problem of contest.problems) {
      const result = resolveMentionsInContent(problem.content, index, "problem")
      problem.content = result.content
      problem.mentions = result.mentions
      unresolved.push(...result.unresolved)
    }
  }

  // 解法側: content の [[...]] を解決（解法ページ表示）
  for (const category of solutions) {
    for (const solution of category.items) {
      const result = resolveMentionsInContent(solution.content, index, "solution")
      solution.content = result.content
      solution.mentions = result.mentions
      unresolved.push(...result.unresolved)
    }
  }

  // バックリンク（タグ）を計算
  // - 問題カード（ホームページ）に表示する言及 → sourceKind="problem"
  // - 解法カード（解法ページ）に表示する言及 → sourceKind="solution"
  const problemBacklinks = collectBacklinks(contests, solutions, index, "problem")
  const solutionBacklinks = collectBacklinks(contests, solutions, index, "solution")

  for (const contest of contests) {
    for (const problem of contest.problems) {
      problem.referencedBy = problemBacklinks.get(`${contest.abc}-${problem.id}`) || []
    }
  }
  for (const category of solutions) {
    for (const solution of category.items) {
      solution.referencedBy = solutionBacklinks.get(solution.id) || []
    }
  }

  return { contests, solutions, unresolved }
}

module.exports = {
  MENTION_PATTERN,
  applyCrossReferences,
  buildProblemIndex,
  buildSolutionIndex,
  collectBacklinks,
  dedupeRefs,
  extractMentionIds,
  resolveMention,
  resolveMentionsInContent,
  splitCodeAndText,
}


