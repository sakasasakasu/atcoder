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
const MAX_REQUESTS_PER_RUN = 50

const MODEL_NAME = "gemini-3.5-flash-lite"
const FALLBACK_MODEL_NAME = "gemini-1.5-flash"
const CACHE_SCHEMA_VERSION = "v2"

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
      if (data && data.version === CACHE_SCHEMA_VERSION && data.items) {
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
        temperature: 0.2,
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
          // モデルが見つからない場合はフォールバックモデルを試す
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

      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!text) throw new Error("API returned empty content")
      return JSON.parse(text)
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

【レビュー要件】
1. complexity: コードから時間計算量を推定し、計算量表記で出力してください。
2. rating: 可読性・変数命名・構造の簡潔さから品質評価を行ってください（S: 極めて綺麗, A: 実用的で良好, B: 標準的・改善余地あり, C: 複雑）。
3. summary: 初心者にも分かりやすく、解法の核心やコードの工夫点を100文字程度でポジティブに説明してください。
4. tags: 使用されている具体的なアルゴリズム・データ構造・解法テクニックのタグを1〜4個指定してください。`
}

/**
 * Contests データに対し、Gemini API を使って各 CodeFile 単位で LLM レビューを追加します。
 * @param {import("./main").Contest[]} contests 
 */
async function enrichContestsWithLlmReviews(contests) {
  loadDotEnv()
  const apiKey = process.env.GEMINI_API_KEY
  const cacheItems = loadCache()

  let apiCallCount = 0
  let isCacheUpdated = false

  if (!apiKey) {
    console.log("GEMINI_API_KEY が設定されていないため、LLM 新規レビューはスキップし、既存キャッシュを適用します。")
  }

  for (const contest of contests) {
    const contestId = contest.abc
    for (const problem of contest.problems) {
      if (!problem.codes || problem.codes.length === 0) continue

      for (const codeFile of problem.codes) {
        const hash = computeHash(problem, codeFile, contestId)

        if (cacheItems[hash]) {
          codeFile.aiReview = cacheItems[hash]
          continue
        }

        if (!apiKey || apiCallCount >= MAX_REQUESTS_PER_RUN) {
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
        }
      }
    }
  }

  if (isCacheUpdated) {
    saveCache(cacheItems)
    console.log(`[LLM Review] ${apiCallCount} 件のコード単位新規レビューを完了し、キャッシュを保存しました。`)
  }
}

module.exports = {
  callGeminiApi,
  computeHash,
  enrichContestsWithLlmReviews,
  loadDotEnv,
}
