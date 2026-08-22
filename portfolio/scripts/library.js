// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")
const {
  MARKDOWN_EXTENSION_PATTERN,
  collectMarkdownCategories,
  listMarkdownFiles,
  listSubdirectories,
  readTextFile,
  sortNamesAsc,
  writeJson,
} = require("./fs-utils")

const DEFAULT_BASE_ROOT = path.join(__dirname, "..", "..", "content", "library")
const CPP_EXTENSION = ".cpp"

/**
 * @typedef {Object} LibraryItem
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {string} cpp
 */

/**
 * @typedef {Object} LibraryCategory
 * @property {string} category
 * @property {LibraryItem[]} items
 */

/**
 * カテゴリ 1 件分のアイテム（.md）を読み込む。
 * 同名の .cpp があれば本文として添付する
 * @param {string} categoryDir
 * @param {string} fileName
 * @returns {LibraryItem}
 */
function collectLibraryItem(categoryDir, fileName) {
  const id = fileName.replace(MARKDOWN_EXTENSION_PATTERN, "")
  const cppPath = path.join(categoryDir, `${id}${CPP_EXTENSION}`)
  return {
    id,
    title: id,
    content: readTextFile(path.join(categoryDir, fileName)).trim(),
    cpp: fs.existsSync(cppPath) ? readTextFile(cppPath) : "",
  }
}

/**
 * library/ 直下のデータを一覧表示用の JSON データに変換する
 * @param {string} [baseRoot]
 * @returns {LibraryCategory[]}
 */
function collectLibraryData(baseRoot = DEFAULT_BASE_ROOT) {
  return collectMarkdownCategories(baseRoot, collectLibraryItem)
}

/**
 * 集計結果を JSON ファイルへ出力する
 * @param {LibraryCategory[]} results
 * @param {string} outputPath
 */
function writeLibraryJson(results, outputPath) {
  writeJson(results, outputPath)
}

if (require.main === module) {
  const results = collectLibraryData(DEFAULT_BASE_ROOT)
  const outputPath = path.join(__dirname, "..", "public", "library.json")
  writeLibraryJson(results, outputPath)

  console.log(`completed tasks. outputed at ${outputPath}`)
}

module.exports = {
  collectLibraryData,
  listMarkdownFiles,
  listSubdirectories,
  sortNamesAsc,
  writeLibraryJson,
}
