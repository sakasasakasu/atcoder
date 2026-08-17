// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path")
const { collectProblemsData, writeProblemsJson } = require("./main")
const { collectSolutionsData, writeSolutionsJson } = require("./solutions")
const { collectLibraryData, writeLibraryJson } = require("./library")
const { collectTipsData, writeTipsJson } = require("./tips")
const { applyCrossReferences } = require("./mentions")

const PROBLEMS_ROOT = path.join(__dirname, "..", "..", "problems")
const SOLUTIONS_ROOT = path.join(__dirname, "..", "..", "solutions")
const LIBRARY_ROOT = path.join(__dirname, "..", "..", "library")
const TIPS_ROOT = path.join(__dirname, "..", "..", "tips")
const OUTPUT_DIR = path.join(__dirname, "..", "public")

/**
 * problems / solutions / library を収集し、相互参照（言及リンク・タグ）を解決して JSON に出力する
 * @returns {{ contests: import("./main").Contest[], solutions: import("./solutions").SolutionCategory[] }}
 */
function generate() {
  const contests = collectProblemsData(PROBLEMS_ROOT)
  const solutions = collectSolutionsData(SOLUTIONS_ROOT)

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
  generate()
}

module.exports = { generate }
