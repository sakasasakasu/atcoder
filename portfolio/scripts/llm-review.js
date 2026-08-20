/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")

const CACHE_DIR = path.join(__dirname, ".cache")
const CACHE_FILE = path.join(CACHE_DIR, "llm-reviews.json")

// 15 RPM を遵守するためのウェイト時間 (4.1秒)
const REQUEST_INTERVAL_MS = 4100
// 200 RPD を遵守するため、1回の実行あたりの最大 API 呼び出し回数
const MAX_REQUESTS_PER_RUN = 50
// 一時的なAPIエラー（429 / 5xx / ネットワークエラー）の最大リトライ回数
const MAX_RETRIES = 3

// 2026年現在、gemini-2.5-flash-lite は新規利用不可のため 3.5 系を使用する
const MODEL_NAME = "gemini-3.5-flash-lite"

// RESPONSE_SCHEMA を変更した場合は必ずこのバージョンを上げ、旧形式のキャッシュを無効化する
const CACHE_SCHEMA_VERSION = "v1"

// responseSchema の定義
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    complexity: {
      type: "STRING",
      description: "時間計算量表記。例: 'O(N log N)', 'O(N + M)', 'O(1)'",
    },
    rating: {
      type: "STRING",
      description: "コードの可読性および品質の評価ランク。'S', 'A', 'B', 'C' のいずれか。",
    },
    summary: {
      type: "STRING",
      description: "コードの工夫点や解法のポイントに関する簡潔な日本語解説・レビュー（80〜120文字程度）。",
    },
    tags: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "アルゴリズム・データ構造・手法に関する技術タグ（1〜4項目）。例: ['二分探索', '動的計画法', '優先度付きキュー']",
    },
  },
  required: ["complexity", "rating", "summary", "tags"],
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function computeHash(problem, contestId) {
  const codesStr = problem.codes.map((c) => `${c.name}:${c.code}`).join("\n")
  const contentStr = `${contestId}:${problem.id}:${problem.content}`
  // RESPONSE_SCHEMA の変更で出力形式が変わった場合は CACHE_SCHEMA_VERSION を上げて旧キャッシュを無効化する
  return crypto.createHash("sha256").update(`${CACHE_SCHEMA_VERSION}\n${contentStr}\n${codesStr}`).digest("hex")
}

function loadCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
    } catch (e) {
      console.warn("LLM レビューキャッシュの読み込みに失敗しました:", e.message)
    }
  }
  return {}
}

function saveCache(cache) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8")
}

async function callGeminiApi(apiKey, promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`

  const requestBody = {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      temperature: 0.2,
    },
  }

  // 一時的な障害（429 / 5xx / ネットワークエラー）に対して最大 MAX_RETRIES 回リトライする
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let res
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })
    } catch (err) {
      // ネットワークエラー（fetch が throw する場合）はリトライ
      if (attempt === MAX_RETRIES) throw err
      console.warn(`[LLM Review] ネットワークエラーのためリトライします (${attempt + 1}/${MAX_RETRIES}):`, err.message)
      await sleep(REQUEST_INTERVAL_MS * attempt)
      continue
    }

    // 429 / 5xx は一時的障害としてリトライ
    if (res.status === 429 || res.status >= 500) {
      if (attempt === MAX_RETRIES) {
        const errText = await res.text()
        throw new Error(`API response error ${res.status}: ${errText}`)
      }
      const retryAfterHeader = res.headers.get("retry-after")
      const retryAfter = retryAfterHeader ? Number(retryAfterHeader) : NaN
      const waitMs = Number.isFinite(retryAfter) ? retryAfter * 1000 : REQUEST_INTERVAL_MS * attempt
      console.warn(
        `[LLM Review] 一時的なAPIエラー (${res.status}) のため ${Math.ceil(waitMs / 1000)} 秒後にリトライします (${attempt + 1}/${MAX_RETRIES})`
      )
      await sleep(waitMs)
      continue
    }

    // 4xx は恒久的なエラーなのでリトライしない
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`API response error ${res.status}: ${errText}`)
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error("API returned empty content")
    return JSON.parse(text)
  }
}

function buildPrompt(contestId, problem) {
  const codeText = problem.codes.length > 0
    ? problem.codes.map((c) => `// --- ${c.name} ---\n${c.code}`).join("\n\n")
    : "（コード未添付）"

  return `あなたは競技プログラミング（AtCoder）の高度な C++ コードレビューアナリストです。
以下の問題情報と C++ 解答コードを分析し、指定された JSON スキーマに従ってレビューを出力してください。

【コンテスト・問題名】
${contestId} ${problem.title}

【問題・解説メモ】
${problem.content}

【解答コード (C++)】
${codeText}

【レビュー要件】
1. complexity: コードから時間計算量を推定し、計算量表記で出力してください。
2. rating: 可読性・変数命名・構造の簡潔さから品質評価を行ってください（S: 極めて綺麗, A: 実用的で良好, B: 標準的・改善余地あり, C: 複雑）。
3. summary: 初心者にも分かりやすく、解法の核心やコードの工夫点を100文字程度でポジティブに説明してください。
4. tags: 使用されている具体的なアルゴリズム・データ構造・解法テクニックのタグを1〜4個指定してください。`
}

/**
 * Contests データに対し、Gemini API を使って LLM レビューを追加します。
 * API キーが未設定の場合はスキップし、既存キャッシュがあるものは即時適用します。
 * @param {import("./main").Contest[]} contests 
 */
async function enrichContestsWithLlmReviews(contests) {
  const apiKey = process.env.GEMINI_API_KEY
  const cache = loadCache()

  let apiCallCount = 0
  let isCacheUpdated = false

  if (!apiKey) {
    console.log("GEMINI_API_KEY が設定されていないため、LLM 新規レビューはスキップし、既存キャッシュを適用します。")
  }

  for (const contest of contests) {
    const contestId = contest.abc
    for (const problem of contest.problems) {
      const hash = computeHash(problem, contestId)

      if (cache[hash]) {
        // キャッシュが存在する場合は即座に割り当て
        problem.aiReview = cache[hash]
        continue
      }

      // API キーがない、または呼び出し上限に達している場合は新規生成スキップ
      if (!apiKey || apiCallCount >= MAX_REQUESTS_PER_RUN) {
        continue
      }

      console.log(`[LLM Review] 生成中: ${contestId} ${problem.title} (${apiCallCount + 1}/${MAX_REQUESTS_PER_RUN})...`)

      try {
        const promptText = buildPrompt(contestId, problem)
        const reviewResult = await callGeminiApi(apiKey, promptText)

        problem.aiReview = reviewResult
        cache[hash] = reviewResult
        isCacheUpdated = true
        apiCallCount++

        // 15 RPM 制限を守るため 4.1秒待機
        await sleep(REQUEST_INTERVAL_MS)
      } catch (err) {
        console.warn(`[LLM Review Warning] ${contestId} ${problem.title} の生成に失敗しました:`, err.message)
      }
    }
  }

  if (isCacheUpdated) {
    saveCache(cache)
    console.log(`[LLM Review] ${apiCallCount} 件の新規レビューを完了し、キャッシュを保存しました。`)
  }
}

module.exports = {
  callGeminiApi,
  computeHash,
  enrichContestsWithLlmReviews,
}
