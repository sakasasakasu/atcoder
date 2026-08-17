// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const DEFAULT_BASE_ROOT = path.join(__dirname, "..", "..", "tips")
const MARKDOWN_EXTENSION = ".md"
const MARKDOWN_EXTENSION_PATTERN = /\.md$/
const README_FILE_NAME = "README.md"

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
 * README.md は説明用のため除外する
 * @param {string} dir
 * @returns {string[]}
 */
function listMarkdownFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(MARKDOWN_EXTENSION) && file !== README_FILE_NAME)
}

/**
 * ファイル名を日本語ロケールの昇順にソートする
 * @param {string[]} names
 * @returns {string[]}
 */
function sortNamesAsc(names) {
  return [...names].sort((a, b) => a.localeCompare(b, "ja"))
}

/**
 * Markdown の先頭見出し（# タイトル）を抽出する
 * @param {string} content
 * @returns {string}
 */
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : ""
}

/**
 * カテゴリ配下の Tips 1 件分のデータを読み込む。
 * 先頭の # 見出しは title として切り出し、content からは除く
 * @param {string} categoryDir
 * @param {string} fileName
 * @returns {Tip}
 */
function collectTip(categoryDir, fileName) {
  const id = fileName.replace(MARKDOWN_EXTENSION_PATTERN, "")
  const content = fs.readFileSync(path.join(categoryDir, fileName), "utf-8")
  const title = extractTitle(content) || id
  const body = content.replace(/^#\s+.+(\r?\n|$)/, "").trim()
  return { id, title, content: body }
}

/**
 * tips/ 直下のカテゴリ配下のデータを一覧表示用の JSON データに変換する
 * @param {string} [baseRoot]
 * @returns {TipCategory[]}
 */
function collectTipsData(baseRoot = DEFAULT_BASE_ROOT) {
  if (!fs.existsSync(baseRoot)) return []

  const results = []
  for (const categoryName of sortNamesAsc(listSubdirectories(baseRoot))) {
    const categoryDir = path.join(baseRoot, categoryName)
    const mdFiles = sortNamesAsc(listMarkdownFiles(categoryDir))
    const items = mdFiles.map((fileName) => collectTip(categoryDir, fileName))
    // .md が 1 件もないカテゴリは出力しない
    if (items.length === 0) continue
    results.push({ category: categoryName, items })
  }
  return results
}

/**
 * 集計結果を JSON ファイルへ出力する
 * @param {TipCategory[]} results
 * @param {string} outputPath
 */
function writeTipsJson(results, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8")
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
