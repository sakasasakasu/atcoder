/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const { callGeminiApi, computeHash, enrichContestsWithLlmReviews } = require("./llm-review")

test("computeHash: 問題の内容から確定的な SHA-256 ハッシュを計算する", () => {
  const problem1 = {
    id: "A",
    title: "A問題",
    content: "AC",
    codes: [{ name: "A", code: "int main() {}" }],
  }

  const problem2 = {
    id: "A",
    title: "A問題",
    content: "AC",
    codes: [{ name: "A", code: "int main() {}" }],
  }

  const problemDifferent = {
    id: "A",
    title: "A問題",
    content: "WA",
    codes: [{ name: "A", code: "int main() {}" }],
  }

  const hash1 = computeHash(problem1, "ABC471")
  const hash2 = computeHash(problem2, "ABC471")
  const hashDiff = computeHash(problemDifferent, "ABC471")

  assert.equal(hash1, hash2)
  assert.notEqual(hash1, hashDiff)
})

test("callGeminiApi: 429 一時エラー後はリトライして成功する", async () => {
  let callCount = 0
  test.mock.method(globalThis, "fetch", async () => {
    callCount++
    if (callCount === 1) {
      // retry-after: 0 により待機時間をゼロにしてテストを高速化する
      return {
        ok: false,
        status: 429,
        headers: new Headers({ "retry-after": "0" }),
        text: async () => "Too Many Requests",
      }
    }
    return {
      ok: true,
      status: 200,
      headers: new Headers(),
      json: async () => ({
        candidates: [{ content: { parts: [{ text: JSON.stringify({ complexity: "O(N)", rating: "A", summary: "テスト", tags: ["greedy"] }) }] } }],
      }),
    }
  })

  try {
    const result = await callGeminiApi("test-key", "prompt")
    assert.deepEqual(result, { complexity: "O(N)", rating: "A", summary: "テスト", tags: ["greedy"] })
    assert.equal(callCount, 2)
  } finally {
    test.mock.restoreAll()
  }
})

test("callGeminiApi: 恒久的なエラー（400）はリトライしない", async () => {
  const fetchMock = test.mock.method(globalThis, "fetch", async () => ({
    ok: false,
    status: 400,
    headers: new Headers(),
    text: async () => "Bad Request",
  }))

  try {
    await assert.rejects(callGeminiApi("test-key", "prompt"), /API response error 400/)
    assert.equal(fetchMock.mock.calls.length, 1)
  } finally {
    test.mock.restoreAll()
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
    // エラーが投げられずに完了すれば合格
    assert.ok(true)
  } finally {
    if (oldApiKey) process.env.GEMINI_API_KEY = oldApiKey
  }
})
