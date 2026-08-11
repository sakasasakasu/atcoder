// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const DEFAULT_BASE_ROOT = path.join(__dirname, "..", "..", "library")
const MARKDOWN_EXTENSION = ".md"
const MARKDOWN_EXTENSION_PATTERN = /\.md$/
const CPP_EXTENSION = ".cpp"
const README_FILE_NAME = "README.md"

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
 * ディレクトリ直下のサブディレクトリ名を列挙する
 * @param {string} dir
 * @returns {string[]}
 */
function listSubdirectories(dir) {
  return fs
    .readdirSync(dir)
    .filter((entry) => fs.statSync(path.join(dir, entry)).isDirectory())
}

/**
 * ディレクトリ直下の .md ファイル名を列挙する
 * README.md はカテゴリの説明用のため除外する
 * @param {string} dir
 * @returns {string[]}
 */
function listMarkdownFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(MARKDOWN_EXTENSION) && file !== README_FILE_NAME)
}

/**
 * カテゴリ名・アイテム名を日本語ロケールの昇順にソートする
 * @param {string[]} names
 * @returns {string[]}
 */
function sortNamesAsc(names) {
  return [...names].sort((a, b) => a.localeCompare(b, "ja"))
}

/**
 * カテゴリ 1 件分のデータを読み込む。
 * アイテム（.md）が 1 件もない場合は null を返す
 * @param {string} libraryBaseDir
 * @param {string} categoryName
 * @returns {LibraryCategory | null}
 */
function collectLibraryCategory(libraryBaseDir, categoryName) {
  const categoryDir = path.join(libraryBaseDir, categoryName)
  const mdFiles = sortNamesAsc(listMarkdownFiles(categoryDir))
  const items = mdFiles.map((fileName) => {
    const id = fileName.replace(MARKDOWN_EXTENSION_PATTERN, "")
    const mdPath = path.join(categoryDir, fileName)
    const cppPath = path.join(categoryDir, `${id}${CPP_EXTENSION}`)
    return {
      id,
      title: id,
      content: fs.readFileSync(mdPath, "utf-8").trim(),
      cpp: fs.existsSync(cppPath) ? fs.readFileSync(cppPath, "utf-8") : "",
    }
  })

  if (items.length === 0) return null
  return { category: categoryName, items }
}

/**
 * library/ 直下のデータを一覧表示用の JSON データに変換する
 * @param {string} [baseRoot]
 * @returns {LibraryCategory[]}
 */
function collectLibraryData(baseRoot = DEFAULT_BASE_ROOT) {
  if (!fs.existsSync(baseRoot)) return []

  const results = []
  for (const categoryName of sortNamesAsc(listSubdirectories(baseRoot))) {
    const category = collectLibraryCategory(baseRoot, categoryName)
    if (category) results.push(category)
  }
  return results
}

/**
 * 集計結果を JSON ファイルへ出力する
 * @param {LibraryCategory[]} results
 * @param {string} outputPath
 */
function writeLibraryJson(results, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8")
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
}
