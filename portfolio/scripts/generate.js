// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path")
const { collectProblemsData, writeProblemsJson } = require("./main")
const { collectSolutionsData, writeSolutionsJson } = require("./solutions")
const { collectLibraryData, writeLibraryJson } = require("./library")
const { collectTipsData, writeTipsJson } = require("./tips")
const { applyCrossReferences } = require("./mentions")
const { fetchProblemModels, enrichContestsWithAtCoderData } = require("./atcoder-api")
const { enrichContestsWithLlmReviews } = require("./llm-review")

const PROBLEMS_ROOT = path.join(__dirname, "..", "..", "problems")
const SOLUTIONS_ROOT = path.join(__dirname, "..", "..", "solutions")
const LIBRARY_ROOT = path.join(__dirname, "..", "..", "library")
const TIPS_ROOT = path.join(__dirname, "..", "..", "tips")
const OUTPUT_DIR = path.join(__dirname, "..", "public")

/**
 * problems / solutions / library を収集し、AtCoder Diff / LLM Review / 言及リンクを付与して JSON に出力する
 * @returns {Promise<{ contests: import("./main").Contest[], solutions: import("./solutions").SolutionCategory[] }>}
 */
async function generate() {
  const contests = collectProblemsData(PROBLEMS_ROOT)
  const solutions = collectSolutionsData(SOLUTIONS_ROOT)

  // 1. AtCoder Problems API から Diff / URL 情報を取得・統合
  try {
    const problemModels = await fetchProblemModels()
    enrichContestsWithAtCoderData(contests, problemModels)
  } catch (err) {
    console.warn("AtCoder Problems データ統合時に警告:", err.message)
  }

  // 2. Gemini 2.5 Flash Lite で LLM レビュー & タグを統合 (Gemini API / キャッシュ)
  try {
    await enrichContestsWithLlmReviews(contests)
  } catch (err) {
    console.warn("LLM レビュー統合時に警告:", err.message)
  }

  // 3. 言及リンク・バックリンクの解決
  const { contests: linkedContests, solutions: linkedSolutions, unresolved } =
    applyCrossReferences(contests, solutions)
  if (unresolved.length > 0) {
    console.warn(`警告: 解決できない言及があります: ${[...new Set(unresolved)].join(", ")}`)
  }

  writeProblemsJson(linkedContests, path.join(OUTPUT_DIR, "problems.json"))
  writeSolutionsJson(linkedSolutions, path.join(OUTPUT_DIR, "solutions.json"))
  writeLibraryJson(collectLibraryData(LIBRARY_ROOT), path.join(OUTPUT_DIR, "library.json"))
  writeTipsJson(collectTipsData(TIPS_ROOT), path.join(OUTPUT_DIR, "tips.json"))

  console.log(`completed tasks. outputed at ${OUTPUT_DIR}`)
  return { contests: linkedContests, solutions: linkedSolutions }
}

if (require.main === module) {
  generate().catch((err) => {
    console.error("生成処理中にエラーが発生しました:", err)
    process.exit(1)
  })
}

module.exports = { generate }

