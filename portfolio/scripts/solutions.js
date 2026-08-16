// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const DEFAULT_BASE_ROOT = path.join(__dirname, "..", "..", "solutions")
const MARKDOWN_EXTENSION = ".md"
const MARKDOWN_EXTENSION_PATTERN = /\.md$/
const CPP_EXTENSION = ".cpp"
const README_FILE_NAME = "README.md"

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
 * solutions/ 直下のデータを一覧表示用の JSON データに変換する
 * @param {string} [baseRoot]
 * @returns {Solution[]}
 */
function collectSolutionsData(baseRoot = DEFAULT_BASE_ROOT) {
  if (!fs.existsSync(baseRoot)) return []

  const solutions = []
  for (const fileName of sortNamesAsc(listMarkdownFiles(baseRoot))) {
    const id = fileName.replace(MARKDOWN_EXTENSION_PATTERN, "")
    const content = fs.readFileSync(path.join(baseRoot, fileName), "utf-8")
    // 先頭の # 見出しは title として切り出し、content からは除く
    const title = extractTitle(content) || id
    const body = content.replace(/^#\s+.+(\r?\n|$)/, "").trim()

    const cppPath = path.join(baseRoot, `${id}${CPP_EXTENSION}`)
    solutions.push({
      id,
      title,
      content: body,
      codes: fs.existsSync(cppPath)
        ? [{ name: id, code: fs.readFileSync(cppPath, "utf-8") }]
        : [],
      mentions: [],
      referencedBy: [],
    })
  }
  return solutions
}

/**
 * 集計結果を JSON ファイルへ出力する
 * @param {Solution[]} results
 * @param {string} outputPath
 */
function writeSolutionsJson(results, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8")
}

if (require.main === module) {
  const results = collectSolutionsData(DEFAULT_BASE_ROOT)
  const outputPath = path.join(__dirname, "..", "public", "solutions.json")
  writeSolutionsJson(results, outputPath)

  console.log(`completed tasks. outputed at ${outputPath}`)
}

module.exports = {
  collectSolutionsData,
  extractTitle,
  listMarkdownFiles,
  sortNamesAsc,
  writeSolutionsJson,
}
