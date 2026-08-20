/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const {
  computeHash,
  enrichContestsWithLlmReviews,
  callGeminiApi,
  cleanText,
  sanitizeReviewResult,
  RESPONSE_SCHEMA,
} = require("./llm-review")

test("computeHash: コードファイル単位で確定的な SHA-256 ハッシュを計算する", () => {
  const problem = { id: "A", title: "A問題", content: "AC" }
  const codeFile1 = { name: "A", code: "int main() {}" }
  const codeFile2 = { name: "A1", code: "int main() {}" }

  const hash1 = computeHash(problem, codeFile1, "ABC471")
  const hash2 = computeHash(problem, codeFile1, "ABC471")
  const hashDiffCode = computeHash(problem, codeFile2, "ABC471")

  assert.equal(hash1, hash2)
  assert.notEqual(hash1, hashDiffCode)
})

test("RESPONSE_SCHEMA: rating に enum 制約、improvement に 5 項目の required 制約が含まれている", () => {
  assert.deepEqual(RESPONSE_SCHEMA.properties.rating.enum, ["S", "A", "B", "C"])
  assert.deepEqual(RESPONSE_SCHEMA.properties.improvement.required, [
    "hasImprovement",
    "bottleneck",
    "suggestion",
    "beforeSnippet",
    "afterSnippet",
  ])
})

test("cleanText: 暴走した無限ループの同一フレーズ反復を除去する", () => {
  const looped = "リスクを回避しますべきですべきですべきですべきですべきですべきですべきです"
  const cleaned = cleanText(looped)
  assert.equal(cleaned, "リスクを回避しますべきです")
})

test("sanitizeReviewResult: 揺らぎのある rating / complexity / tags / スニペットを正規化する", () => {
  const raw = {
    complexity: "  $O(N \\log N)$  ",
    rating: "S Rank (最高)",
    summary: "  簡潔なコードです。  ",
    tags: ["#二分探索", " 累積和 ", "#", ""],
    improvement: {
      hasImprovement: true,
      bottleneck: " 二重ループです ",
      suggestion: " map を使います ",
      beforeSnippet: "```cpp\nfor(int i=0;i<n;i++) {}\n```",
      afterSnippet: "```\nmap<int, int> mp;\n```",
    },
  }

  const result = sanitizeReviewResult(raw)
  assert.equal(result.complexity, "O(N \\log N)")
  assert.equal(result.rating, "S")
  assert.equal(result.summary, "簡潔なコードです。")
  assert.deepEqual(result.tags, ["二分探索", "累積和"])
  assert.equal(result.improvement.hasImprovement, true)
  assert.equal(result.improvement.bottleneck, "二重ループです")
  assert.equal(result.improvement.suggestion, "map を使います")
  assert.equal(result.improvement.beforeSnippet, "for(int i=0;i<n;i++) {}")
  assert.equal(result.improvement.afterSnippet, "map<int, int> mp;")
})

test("sanitizeReviewResult: hasImprovement が false の場合は余計なフィールドを含めない", () => {
  const raw = {
    complexity: "O(1)",
    rating: "A",
    summary: "良好",
    tags: ["算術演算"],
    improvement: {
      hasImprovement: false,
      bottleneck: "",
      suggestion: "",
      beforeSnippet: "",
      afterSnippet: "",
    },
  }

  const result = sanitizeReviewResult(raw)
  assert.equal(result.improvement.hasImprovement, false)
  assert.equal(result.improvement.bottleneck, undefined)
})

test("sanitizeReviewResult: afterSnippet または beforeSnippet が欠落している場合は false にフォールバックする", () => {
  const raw = {
    complexity: "O(N^2)",
    rating: "B",
    summary: "テスト",
    tags: ["全探索"],
    improvement: {
      hasImprovement: true,
      bottleneck: "二重ループです",
      suggestion: "map を使います",
      beforeSnippet: "for(int i=0;i<n;i++) {}",
      afterSnippet: "", // After が空
    },
  }

  const result = sanitizeReviewResult(raw)
  assert.equal(result.improvement.hasImprovement, false)
})

test("callGeminiApi: 429 一時エラー後はリトライして成功する", async () => {
  const originalFetch = global.fetch
  let callCount = 0

  global.fetch = async () => {
    callCount++
    if (callCount === 1) {
      return {
        ok: false,
        status: 429,
        text: async () => "Rate limit exceeded",
      }
    }
    return {
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    complexity: "O(1)",
                    rating: "A",
                    summary: "テスト",
                    tags: ["テスト"],
                    improvement: {
                      hasImprovement: false,
                      bottleneck: "",
                      suggestion: "",
                      beforeSnippet: "",
                      afterSnippet: "",
                    },
                  }),
                },
              ],
            },
          },
        ],
      }),
    }
  }

  try {
    const result = await callGeminiApi("fake-key", "prompt text", 2)
    assert.equal(result.complexity, "O(1)")
    assert.equal(callCount, 2)
  } finally {
    global.fetch = originalFetch
  }
})

test("callGeminiApi: 恒久的なエラー（400）はリトライしない", async () => {
  const originalFetch = global.fetch
  let callCount = 0

  global.fetch = async () => {
    callCount++
    return {
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    }
  }

  try {
    await assert.rejects(
      async () => {
        await callGeminiApi("fake-key", "prompt text", 3)
      },
      (err) => {
        assert.match(err.message, /API response error 400/)
        return true
      }
    )
    assert.equal(callCount, 1)
  } finally {
    global.fetch = originalFetch
  }
})

test("enrichContestsWithLlmReviews: APIキーが無い場合はクラッシュせずスキップする", async () => {
  const oldApiKey = process.env.GEMINI_API_KEY
  delete process.env.GEMINI_API_KEY

  const contests = [
    {
      abc: "ABC471",
      summary: "テスト",
      flat: false,
      problems: [
        {
          id: "A",
          title: "A問題",
          codes: [{ name: "A", code: "int main() {}" }],
          content: "テスト",
          mentions: [],
          referencedBy: [],
        },
      ],
    },
  ]

  try {
    await enrichContestsWithLlmReviews(contests)
    assert.ok(true)
  } finally {
    if (oldApiKey) process.env.GEMINI_API_KEY = oldApiKey
  }
})

test("parseArgs: CLI 引数（--force-llm, --refresh-contest, --refresh-problem）を正しく解析する", () => {
  const { parseArgs } = require("./generate")

  const res1 = parseArgs(["--force-llm"])
  assert.equal(res1.forceLlm, true)
  assert.equal(res1.refreshContest, null)

  const res2 = parseArgs(["-c", "ABC471", "-p", "ABC471-B"])
  assert.equal(res2.forceLlm, false)
  assert.equal(res2.refreshContest, "ABC471")
  assert.equal(res2.refreshProblem, "ABC471-B")
})

