// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const MARKDOWN_EXTENSION = ".md"
const MARKDOWN_EXTENSION_PATTERN = /\.md$/
const README_FILE_NAME = "README.md"

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
 * README.md はカテゴリ説明用のため除外する
 * @param {string} dir
 * @returns {string[]}
 */
function listMarkdownFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(MARKDOWN_EXTENSION) && file !== README_FILE_NAME)
}

/**
 * 文字列を日本語ロケールの昇順にソートする
 * @param {string[]} names
 * @returns {string[]}
 */
function sortNamesAsc(names) {
  return [...names].sort((a, b) => a.localeCompare(b, "ja"))
}

/**
 * ファイルを読み込んで文字列を返す
 * @param {string} filePath
 * @returns {string}
 */
function readTextFile(filePath) {
  return fs.readFileSync(filePath, "utf-8")
}

/**
 * オブジェクトを整形 JSON としてファイルへ出力する
 * @param {unknown} data
 * @param {string} outputPath
 */
function writeJson(data, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf-8")
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
 * Markdown の先頭見出し（# タイトル）行を除去して本文を返す
 * @param {string} content
 * @returns {string}
 */
function stripTitleHeading(content) {
  return content.replace(/^#\s+.+(\r?\n|$)/, "").trim()
}

/**
 * 「カテゴリディレクトリ配下の .md = 1 アイテム」形式のデータを収集する共通ヘルパー。
 * - ルートが存在しない場合は空配列
 * - .md が 1 件もないカテゴリは出力しない
 * @param {string} baseRoot
 * @param {(categoryDir: string, fileName: string) => T} buildItem アイテムを構築するコールバック
 * @returns {{ category: string, items: T[] }[]}
 * @template T
 */
function collectMarkdownCategories(baseRoot, buildItem) {
  if (!fs.existsSync(baseRoot)) return []

  const results = []
  for (const categoryName of sortNamesAsc(listSubdirectories(baseRoot))) {
    const categoryDir = path.join(baseRoot, categoryName)
    const items = sortNamesAsc(listMarkdownFiles(categoryDir)).map((fileName) =>
      buildItem(categoryDir, fileName),
    )
    if (items.length === 0) continue
    results.push({ category: categoryName, items })
  }
  return results
}

module.exports = {
  MARKDOWN_EXTENSION,
  MARKDOWN_EXTENSION_PATTERN,
  README_FILE_NAME,
  collectMarkdownCategories,
  extractTitle,
  listMarkdownFiles,
  listSubdirectories,
  readTextFile,
  sortNamesAsc,
  stripTitleHeading,
  writeJson,
}