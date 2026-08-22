// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
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

const DEFAULT_BASE_ROOT = path.join(__dirname, "..", "..", "content", "tips")

/**
 * @typedef {Object} Tip
 * @property {string} id
 * @property {string} title
 * @property {string} content
 */

/**
 * @typedef {Object} TipCategory
 * @property {string} category
 * @property {Tip[]} items
 */

/**
 * カテゴリ配下の Tips 1 件分のデータを読み込む。
 * 先頭の # 見出しは title として切り出し、content からは除く
 * @param {string} categoryDir
 * @param {string} fileName
 * @returns {Tip}
 */
function collectTip(categoryDir, fileName) {
  const id = fileName.replace(MARKDOWN_EXTENSION_PATTERN, "")
  const content = readTextFile(path.join(categoryDir, fileName))
  const title = extractTitle(content) || id
  return { id, title, content: stripTitleHeading(content) }
}

/**
 * tips/ 直下のカテゴリ配下のデータを一覧表示用の JSON データに変換する
 * @param {string} [baseRoot]
 * @returns {TipCategory[]}
 */
function collectTipsData(baseRoot = DEFAULT_BASE_ROOT) {
  return collectMarkdownCategories(baseRoot, collectTip)
}

/**
 * 集計結果を JSON ファイルへ出力する
 * @param {TipCategory[]} results
 * @param {string} outputPath
 */
function writeTipsJson(results, outputPath) {
  writeJson(results, outputPath)
}

if (require.main === module) {
  const results = collectTipsData(DEFAULT_BASE_ROOT)
  const outputPath = path.join(__dirname, "..", "public", "tips.json")
  writeTipsJson(results, outputPath)

  console.log(`completed tasks. outputed at ${outputPath}`)
}

module.exports = {
  collectTip,
  collectTipsData,
  extractTitle,
  listMarkdownFiles,
  listSubdirectories,
  sortNamesAsc,
  writeTipsJson,
}
