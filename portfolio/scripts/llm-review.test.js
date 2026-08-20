/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const { computeHash, enrichContestsWithLlmReviews } = require("./llm-review")

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
