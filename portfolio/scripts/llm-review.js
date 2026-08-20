/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const CACHE_DIR = path.join(__dirname, ".cache")
const CACHE_FILE = path.join(CACHE_DIR, "llm-reviews.json")

/**
 * Node.js 実行時に .env ファイルが存在すれば自動読み込みして process.env に適用
 */
function loadDotEnv() {
  const envPaths = [
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", "..", ".env"),
  ]
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      try {
        const content = fs.readFileSync(envPath, "utf-8")
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith("#")) continue
          const eqIdx = trimmed.indexOf("=")
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim()
            let val = trimmed.slice(eqIdx + 1).trim()
            if (
              (val.startsWith('"') && val.endsWith('"')) ||
              (val.startsWith("'") && val.endsWith("'"))
            ) {
              val = val.slice(1, -1)
            }
            if (!process.env[key]) {
              process.env[key] = val
            }
          }
        }
      } catch (e) {
        console.warn("Failed to load .env file:", e.message)
      }
    }
  }
}

// スクリプト読み込み時に .env を適用
loadDotEnv()

// 15 RPM を遵守するためのウェイト時間 (4.1秒)
const REQUEST_INTERVAL_MS = 4100
// 200 RPD を遵守するため、1回の実行あたりの最大 API 呼び出し回数
const MAX_REQUESTS_PER_RUN = 60

const MODEL_NAME = "gemini-2.5-flash"
const FALLBACK_MODEL_NAME = "gemini-2.0-flash"
const CACHE_SCHEMA_VERSION = "v2"

// responseSchema の定義
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    complexity: {
      type: "STRING",
      description: "時間計算量表記。例: 'O(N log N)', 'O(N + M)', 'O(1)'。余計な文章や空間計算量は含めないでください。",
    },
    rating: {
      type: "STRING",
      enum: ["S", "A", "B", "C"],
      description: "コードの可読性および品質の評価ランク。'S', 'A', 'B', 'C' のいずれか 1 文字。",
    },
    summary: {
      type: "STRING",
      description: "コードの工夫点や解法のポイントに関する簡潔な日本語解説・レビュー（80〜120文字程度）。",
    },
    tags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "アルゴリズム・データ構造・手法に関する技術タグ（1〜3項目）。例: ['二分探索', '動的計画法', '優先度付きキュー']",
    },
    improvement: {
      type: "OBJECT",
      properties: {
        hasImprovement: {
          type: "BOOLEAN",
          description: "アルゴリズムやデータ構造の観点で明確な計算量削減やロジック効率化の余地がある場合は true、すでに最適解の場合は false。",
        },
        bottleneck: {
          type: "STRING",
          description: "非効率なボトルネック箇所の簡潔な説明（1〜2文・60文字以内）。hasImprovementがfalseの場合は空文字 \"\"。",
        },
        suggestion: {
          type: "STRING",
          description: "改善方針の簡潔な説明（1〜2文・60文字以内）。hasImprovementがfalseの場合は空文字 \"\"。",
        },
        beforeSnippet: {
          type: "STRING",
          description: "改善対象となる問題箇所のコード抜粋（2〜5行程度）。マークダウン記号（```など）は含めない生テキスト。hasImprovementがfalseの場合は空文字 \"\"。",
        },
        afterSnippet: {
          type: "STRING",
          description: "改善後の推奨ロジックのコード抜粋（2〜5行程度）。マークダウン記号（```など）は含めない生テキスト。hasImprovementがfalseの場合は空文字 \"\"。",
        },
      },
      required: ["hasImprovement", "bottleneck", "suggestion", "beforeSnippet", "afterSnippet"],
    },
  },
  required: ["complexity", "rating", "summary", "tags", "improvement"],
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * コード単位で SHA-256 ハッシュを計算します
 */
function computeHash(problem, codeFile, contestId) {
  const codeContent = `${codeFile.name}:${codeFile.code}`
  const contentStr = `${contestId}:${problem.id}:${problem.content}`
  return crypto.createHash("sha256").update(`${CACHE_SCHEMA_VERSION}:${contentStr}\n${codeContent}`).digest("hex")
}

function loadCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
      if (data && data.items) {
        return data.items
      }
    } catch (e) {
      console.warn("LLM レビューキャッシュの読み込みに失敗しました:", e.message)
    }
  }
  return {}
}

function saveCache(cacheItems) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  const payload = {
    version: CACHE_SCHEMA_VERSION,
    items: cacheItems,
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2), "utf-8")
}

/**
 * テキストから連続する無限ループの繰り返し（例: "べきですべきです..."）を除去
 * @param {any} str
 * @returns {string}
 */
function cleanText(str) {
  if (typeof str !== "string") return ""
  let text = str.trim()
  // 連続する同一フレーズの暴走ループ（3回以上の連続反復）を1回に圧縮
  text = text.replace(/(.{2,20}?)\1{3,}/g, "$1")
  return text
}

/**
 * LLM の出力揺らぎを吸収し、確実に型安全なオブジェクトに正規化します
 * @param {any} raw
 * @returns {{ complexity: string, rating: string, summary: string, tags: string[], improvement: { hasImprovement: boolean, bottleneck?: string, suggestion?: string, beforeSnippet?: string, afterSnippet?: string } }}
 */
function sanitizeReviewResult(raw) {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid review format: response is not an object")
  }

  // 1. rating の正規化 ('S' | 'A' | 'B' | 'C')
  let rating = "B"
  if (typeof raw.rating === "string") {
    const trimmed = raw.rating.trim().toUpperCase()
    const match = trimmed.match(/^[SABC]$/) || trimmed.match(/([SABC])/)
    if (match) {
      rating = match[1]
    }
  }

  // 2. complexity の正規化 (例: "$O(N)$" や "計算量: O(N log N)" -> "O(N log N)")
  let complexity = "O(N)"
  if (typeof raw.complexity === "string" && raw.complexity.trim()) {
    let comp = raw.complexity.trim()
    comp = comp.replace(/^\$+|\$+$/g, "").trim()
    comp = comp.replace(/^計算量\s*[:：]\s*/i, "").trim()
    if (comp) {
      complexity = comp
    }
  }

  // 3. summary の正規化
  const summary = cleanText(raw.summary)

  // 4. tags の正規化 (1〜4個の非空文字列配列、#除去)
  let tags = []
  if (Array.isArray(raw.tags)) {
    tags = raw.tags
      .filter((t) => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim().replace(/^#+/, "").trim())
      .filter((t) => t.length > 0)
      .slice(0, 4)
  }

  // 5. improvement の正規化
  const rawImp = raw.improvement && typeof raw.improvement === "object" ? raw.improvement : {}
  let hasImprovement = Boolean(rawImp.hasImprovement)

  const cleanSnippet = (snip) => {
    if (typeof snip !== "string") return ""
    return snip
      .replace(/^```[a-zA-Z]*\r?\n?/g, "")
      .replace(/\r?\n?```$/g, "")
      .trim()
  }

  const bottleneck = cleanText(rawImp.bottleneck)
  const suggestion = cleanText(rawImp.suggestion)
  const beforeSnippet = cleanSnippet(rawImp.beforeSnippet)
  const afterSnippet = cleanSnippet(rawImp.afterSnippet)

  // 改善余地が true でも、ボトルネック・提案・Before・After のいずれかが欠落している場合は安全のため false に補正
  if (hasImprovement && (!bottleneck || !suggestion || !beforeSnippet || !afterSnippet)) {
    hasImprovement = false
  }

  const improvement = {
    hasImprovement,
  }

  if (hasImprovement) {
    improvement.bottleneck = bottleneck
    improvement.suggestion = suggestion
    improvement.beforeSnippet = beforeSnippet
    improvement.afterSnippet = afterSnippet
  }

  return {
    complexity,
    rating,
    summary,
    tags,
    improvement,
  }
}

async function callGeminiApi(apiKey, promptText, retries = 3) {
  const models = [MODEL_NAME, FALLBACK_MODEL_NAME]
  let lastErr = null

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const requestBody = {
      contents: [
        {
          parts: [{ text: promptText }],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        temperature: 0.1,
        maxOutputTokens: 2048,
      },
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      let res
      try {
        res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
      } catch (err) {
        if (attempt === retries) {
          lastErr = err
          break
        }
        await sleep(2000)
        continue
      }

      if (!res.ok) {
        const errText = await res.text()
        if (res.status === 404) {
          lastErr = new Error(`API response error ${res.status}: ${errText}`)
          break
        }
        if ((res.status === 429 || res.status >= 500) && attempt < retries) {
          console.warn(`[LLM Review] 一時的なAPIエラー (${res.status}) のため 2 秒後にリトライします (${attempt}/${retries})`)
          await sleep(2000)
          continue
        }
        throw new Error(`API response error ${res.status}: ${errText}`)
      }

      try {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
          throw new Error("API returned empty content")
        }
        const parsed = JSON.parse(text)
        return sanitizeReviewResult(parsed)
      } catch (err) {
        lastErr = err
        if (attempt < retries) {
          console.warn(`[LLM Review] 応答解析エラーのためリトライします (${attempt}/${retries}): ${err.message}`)
          await sleep(2000)
          continue
        }
        break
      }
    }
  }

  throw lastErr || new Error("Gemini API の呼び出しに失敗しました")
}

function buildPrompt(contestId, problem, codeFile) {
  return `あなたは競技プログラミング（AtCoder）の高度な C++ コードレビューアナリストです。
以下の問題情報と指定された C++ 解答コード (${codeFile.name}.cpp) を分析し、指定された JSON スキーマに従ってレビューを出力してください。

【コンテスト・問題名】
${contestId} ${problem.title}

【問題・解説メモ】
${problem.content}

【解答コード (${codeFile.name}.cpp)】
${codeFile.code}

【レビュー要件と厳格な評価基準】
1. complexity (時間計算量):
   - コードから時間計算量を推定し、'O(1)', 'O(N)', 'O(N log N)', 'O(N^2)', 'O(N + M)', 'O(2^N)' などの標準的なビッグオー記法のみを出力してください。
   - 日本語の注記（例: "最悪時"）や空間計算量は含めないでください。
2. rating (総合品質ランク):
   - 以下の基準に従い、必ず 'S', 'A', 'B', 'C' のいずれか 1 文字を出力してください。
     - S: 最適なアルゴリズム・計算量であり、コードが極めて簡潔・明瞭で無駄がない。
     - A: アルゴリズム・計算量が十分であり、標準的かつ良好な実装。
     - B: 正解しているが、計算量の改善余地や冗長な処理・改善可能な箇所がある。
     - C: 計算量が大幅に非効率、または可読性や構造に大きな問題がある。
3. summary (要約解説):
   - 解法の核心・アプローチとコードの工夫点を、初心者にも分かりやすい日本語で 80〜120 文字程度で簡潔に記述してください。
4. tags (技術タグ):
   - 使用されている具体的なアルゴリズム・データ構造（例: 二分探索, 累積和, 動的計画法, 貪欲法, 全探索, 幅優先探索, 深さ優先探索, 素因数分解, 優先度付きキュー, Union-Find, std::map, std::set など）から 1〜3 個を選択してください。
5. improvement (アルゴリズム・ロジック改善提案):
   - 本質的な計算量削減やアルゴリズム・データ構造の効率化余地がある場合のみ hasImprovement: true としてください（例: O(N^2) を map や sort で O(N log N) に短縮できる等）。
   - 単なる cin.tie や std::endl 改行の変更、変数名変更などの些細なスタイル・I/O 高速化は改善対象外とし、hasImprovement: false としてください。
   - すでに十分最適・定数倍レベルの差しかない場合は hasImprovement: false としてください。
   - hasImprovement が true の場合:
     - bottleneck: どこがなぜ非効率かを 1〜2 文（60文字以内）で説明。同一語句の反復は禁止。
     - suggestion: どう改善すべきかを 1〜2 文（60文字以内）で説明。同一語句の反復は禁止。
     - beforeSnippet: 改善対象の該当コード（ロジック部分の 2〜5 行）。※ \`\`\` 等のマークダウン記号は含めず生コードのみ。
     - afterSnippet: 改善後の推奨コード（2〜5 行）。※ \`\`\` 等のマークダウン記号は含めず生コードのみ。必ず beforeSnippet と afterSnippet の両方を出力してください。
   - hasImprovement が false の場合:
     - bottleneck, suggestion, beforeSnippet, afterSnippet はすべて空文字列 "" としてください。`
}

/**
 * Contests データに対し、Gemini API を使って各 CodeFile 単位で LLM レビューを追加します。
 * @param {import("./main").Contest[]} contests 
 * @param {{ forceLlm?: boolean, refreshContest?: string, refreshProblem?: string }} [options]
 */
async function enrichContestsWithLlmReviews(contests, options = {}) {
  loadDotEnv()
  const apiKey = process.env.GEMINI_API_KEY
  const cacheItems = loadCache()

  const forceAll = Boolean(options.forceLlm)
  const targetContest = options.refreshContest ? options.refreshContest.trim().toUpperCase() : null
  const targetProblem = options.refreshProblem ? options.refreshProblem.trim().toUpperCase() : null

  let apiCallCount = 0
  let isCacheUpdated = false

  if (!apiKey) {
    console.log("GEMINI_API_KEY が設定されていないため、LLM 新規レビューはスキップし、既存キャッシュを適用します。")
  }

  for (const contest of contests) {
    const contestId = contest.abc
    const isContestMatch = targetContest && contestId.toUpperCase() === targetContest

    for (const problem of contest.problems) {
      if (!problem.codes || problem.codes.length === 0) continue

      const problemKey = `${contestId}-${problem.id}`.toUpperCase()
      const isProblemMatch =
        targetProblem &&
        (problemKey === targetProblem ||
          problem.id.toUpperCase() === targetProblem ||
          `${contestId}_${problem.id}`.toUpperCase() === targetProblem)

      const shouldForceRegenerate = forceAll || isContestMatch || isProblemMatch

      for (const codeFile of problem.codes) {
        const hash = computeHash(problem, codeFile, contestId)

        // 再生成フラグがない場合は既存キャッシュを優先
        if (!shouldForceRegenerate && cacheItems[hash]) {
          codeFile.aiReview = cacheItems[hash]
          continue
        }

        if (!apiKey || apiCallCount >= MAX_REQUESTS_PER_RUN) {
          // API呼び出し不可または上限時は既存キャッシュがあれば適用
          if (cacheItems[hash]) {
            codeFile.aiReview = cacheItems[hash]
          }
          continue
        }

        console.log(`[LLM Review] 生成中: ${contestId} ${problem.title} (${codeFile.name}) (${apiCallCount + 1}/${MAX_REQUESTS_PER_RUN})...`)

        try {
          const promptText = buildPrompt(contestId, problem, codeFile)
          const reviewResult = await callGeminiApi(apiKey, promptText)

          codeFile.aiReview = reviewResult
          cacheItems[hash] = reviewResult
          isCacheUpdated = true
          apiCallCount++

          await sleep(REQUEST_INTERVAL_MS)
        } catch (err) {
          console.warn(`[LLM Review Warning] ${contestId} ${problem.title} (${codeFile.name}) の生成に失敗しました:`, err.message)
          if (cacheItems[hash]) {
            codeFile.aiReview = cacheItems[hash]
          }
        }
      }
    }
  }

  if (isCacheUpdated) {
    saveCache(cacheItems)
    console.log(`[LLM Review] ${apiCallCount} 件のコード単位レビューを完了し、キャッシュを保存しました。`)
  }
}

module.exports = {
  callGeminiApi,
  computeHash,
  enrichContestsWithLlmReviews,
  loadDotEnv,
  cleanText,
  sanitizeReviewResult,
  RESPONSE_SCHEMA,
  buildPrompt,
}
