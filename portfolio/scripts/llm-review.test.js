/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const { computeHash, enrichContestsWithLlmReviews, callGeminiApi } = require("./llm-review")

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
