/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const {
  getDifficultyColor,
  getDisplayDifficulty,
  formatProblemId,
  getAtCoderUrl,
  getAtCoderProblemsUrl,
  enrichContestsWithAtCoderData,
} = require("./atcoder-api")

test("getDisplayDifficulty: 400未満の補正ロジックが正しく機能する", () => {
  assert.equal(getDisplayDifficulty(null), null)
  assert.equal(getDisplayDifficulty(undefined), null)

  assert.equal(getDisplayDifficulty(800), 800)
  assert.equal(getDisplayDifficulty(400), 400)
  assert.equal(getDisplayDifficulty(286), 301)
  assert.equal(getDisplayDifficulty(-817), 19)
  assert.equal(getDisplayDifficulty(-451), 48)
})

test("getDifficultyColor: 難易度に応じた適切なカラー表現とラベルを返す", () => {
  assert.equal(getDifficultyColor(null).label, "Unrated")
  assert.equal(getDifficultyColor(undefined).label, "Unrated")

  assert.equal(getDifficultyColor(19).label, "灰")
  assert.equal(getDifficultyColor(200).label, "灰")
  assert.equal(getDifficultyColor(400).label, "茶")
  assert.equal(getDifficultyColor(850).label, "緑")
  assert.equal(getDifficultyColor(1200).label, "水")
  assert.equal(getDifficultyColor(1650).label, "青")
  assert.equal(getDifficultyColor(2050).label, "黄")
  assert.equal(getDifficultyColor(2500).label, "橙")
  assert.equal(getDifficultyColor(2900).label, "赤")
})

test("formatProblemId: コンテストIDと問題記号を正しく整形する", () => {
  assert.equal(formatProblemId("ABC471", "A"), "abc471_a")
  assert.equal(formatProblemId("abc001", "B"), "abc001_b")
})

test("getAtCoderUrl / getAtCoderProblemsUrl: 正しい URL を生成する", () => {
  assert.equal(getAtCoderUrl("ABC471", "A"), "https://atcoder.jp/contests/abc471/tasks/abc471_a")
  assert.equal(getAtCoderProblemsUrl("ABC471"), "https://kenkoooo.com/atcoder/#/table/abc471")
})

test("enrichContestsWithAtCoderData: コンテストデータに Diff と URL を正しく統合する", () => {
  const contests = [
    {
      abc: "ABC471",
      summary: "テスト",
      flat: false,
      problems: [
        { id: "A", title: "A問題", codes: [], content: "", mentions: [], referencedBy: [] },
        { id: "B", title: "B問題", codes: [], content: "", mentions: [], referencedBy: [] },
      ],
    },
  ]

  const problemModels = {
    abc471_a: { difficulty: -817 },
  }

  enrichContestsWithAtCoderData(contests, problemModels)

  assert.equal(contests[0].problems[0].url, "https://atcoder.jp/contests/abc471/tasks/abc471_a")
  assert.equal(contests[0].problems[0].problemsUrl, "https://kenkoooo.com/atcoder/#/table/abc471")
  assert.equal(contests[0].problems[0].difficulty, 19)
  assert.equal(contests[0].problems[0].difficultyColor.label, "灰")

  assert.equal(contests[0].problems[1].difficulty, undefined)
  assert.equal(contests[0].problems[1].difficultyColor.label, "Unrated")
})
