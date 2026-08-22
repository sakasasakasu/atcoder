// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")
const {
  MARKDOWN_EXTENSION_PATTERN,
  collectMarkdownCategories,
  extractTitle,
  listMarkdownFiles,
  listSubdirectories,
  readTextFile,
  sortNamesAsc,
  stripTitleHeading,
  writeJson,
} = require("./fs-utils")

const DEFAULT_BASE_ROOT = path.join(__dirname, "..", "..", "content", "solutions")
const CPP_EXTENSION = ".cpp"

/**
 * @typedef {Object} Solution
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {import("./common").CodeFile[]} codes
 * @property {import("./mentions").MentionRef[]} mentions
 * @property {import("./mentions").MentionRef[]} referencedBy
 */

/**
 * @typedef {Object} SolutionCategory
 * @property {string} category
 * @property {Solution[]} items
 */

/**
 * カテゴリ配下の解法 1 件分のデータを読み込む。
 * 先頭の # 見出しは title として切り出し、content からは除く
 * @param {string} categoryDir
 * @param {string} fileName
 * @returns {Solution}
 */
function collectSolution(categoryDir, fileName) {
  const id = fileName.replace(MARKDOWN_EXTENSION_PATTERN, "")
  const content = readTextFile(path.join(categoryDir, fileName))
  const title = extractTitle(content) || id

  const cppPath = path.join(categoryDir, `${id}${CPP_EXTENSION}`)
  return {
    id,
    title,
    content: stripTitleHeading(content),
    codes: fs.existsSync(cppPath)
      ? [{ name: id, code: readTextFile(cppPath) }]
      : [],
    mentions: [],
    referencedBy: [],
  }
}

/**
 * solutions/ 直下のカテゴリ配下のデータを一覧表示用の JSON データに変換する
 * @param {string} [baseRoot]
 * @returns {SolutionCategory[]}
 */
function collectSolutionsData(baseRoot = DEFAULT_BASE_ROOT) {
  return collectMarkdownCategories(baseRoot, collectSolution)
}

/**
 * 集計結果を JSON ファイルへ出力する
 * @param {SolutionCategory[]} results
 * @param {string} outputPath
 */
function writeSolutionsJson(results, outputPath) {
  writeJson(results, outputPath)
}

if (require.main === module) {
  const results = collectSolutionsData(DEFAULT_BASE_ROOT)
  const outputPath = path.join(__dirname, "..", "public", "solutions.json")
  writeSolutionsJson(results, outputPath)

  console.log(`completed tasks. outputed at ${outputPath}`)
}

module.exports = {
  collectSolution,
  collectSolutionsData,
  extractTitle,
  listMarkdownFiles,
  listSubdirectories,
  sortNamesAsc,
  writeSolutionsJson,
}
