const fs = require("fs")
const path = require("path")

const ABC_DIR_NAME = "ABC"
const TYPICAL_DIR_NAME = "典型"
const README_FILE_NAME = "README.md"
const CPP_FILE_EXTENSION = ".cpp"
const CPP_FILE_EXTENSION_PATTERN = /\.cpp$/

// 問題セクションの見出し（例: ## A問題）
const PROBLEM_SECTION_HEADER = /## ([A-G])問題/
const PROBLEM_SECTION_SPLIT = /(?=## [A-G]問題)/

/**
 * @typedef {Object} Problem
 * @property {string} id
 * @property {string} title
 * @property {string} cpp
 * @property {string} content
 */

/**
 * @typedef {Object} Contest
 * @property {string} abc
 * @property {string} summary
 * @property {Problem[]} problems
 */

/**
 * @typedef {Object} ReadmeSection
 * @property {string} id
 * @property {string} content
 */

/**
 * @typedef {Object} ParsedReadme
 * @property {string} summary
 * @property {ReadmeSection[]} sections
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
 * ディレクトリ直下の .cpp ファイル名を列挙する
 * main.cpp はローカル作業用の一時ファイルのため除外する
 * @param {string} dir
 * @returns {string[]}
 */
function listTypicalCppFiles(dir) {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(CPP_FILE_EXTENSION) && file !== "main.cpp")
}

/**
 * ABC コンテストディレクトリ名を降順にソートする（既存仕様を維持）
 * @param {string[]} names
 * @returns {string[]}
 */
function sortAbcDirsDesc(names) {
  return [...names].sort((a, b) => (a > b ? -1 : 1))
}

/**
 * 典型問題のファイル名を数値昇順にソートする（既存仕様を維持）
 * @param {string[]} names
 * @returns {string[]}
 */
function sortTypicalFilesAsc(names) {
  return [...names].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
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
 * ファイルが存在すれば読み込み、存在しなければ空文字を返す
 * @param {string} filePath
 * @returns {string}
 */
function readTextFileIfExists(filePath) {
  if (!fs.existsSync(filePath)) return ""
  return readTextFile(filePath)
}

/**
 * README.md の内容を summary と問題セクションに解析する
 * @param {string} readmeContent
 * @returns {ParsedReadme}
 */
function parseReadme(readmeContent) {
  const sections = readmeContent.split(PROBLEM_SECTION_SPLIT)

  const rawSummary = sections.shift() || ""
  const summary = rawSummary.replace(/^#\s+.+\r?\n?/, "").trim()

  const parsedSections = []
  for (const section of sections) {
    const headerMatch = section.match(PROBLEM_SECTION_HEADER)
    if (!headerMatch) continue

    parsedSections.push({
      id: headerMatch[1],
      content: section.replace(PROBLEM_SECTION_HEADER, "").trim(),
    })
  }

  return { summary, sections: parsedSections }
}

/**
 * ABC コンテスト 1 件分のデータを読み込む。
 * README.md がない場合は null を返す（既存仕様: 静かにスキップ）
 * @param {string} abcBaseDir
 * @param {string} dirName
 * @returns {Contest | null}
 */
function collectAbcContest(abcBaseDir, dirName) {
  const dirPath = path.join(abcBaseDir, dirName)
  const readmePath = path.join(dirPath, README_FILE_NAME)
  if (!fs.existsSync(readmePath)) return null

  const parsed = parseReadme(readTextFile(readmePath))
  const problems = parsed.sections.map((section) => ({
    id: section.id,
    title: `${section.id}問題`,
    cpp: readTextFileIfExists(path.join(dirPath, `${section.id}${CPP_FILE_EXTENSION}`)),
    content: section.content,
  }))

  return {
    abc: dirName,
    summary: parsed.summary,
    problems,
  }
}

/**
 * 典型問題 1 セクション分のデータを読み込む
 * @param {string} typicalBaseDir
 * @returns {Contest}
 */
function collectTypicalContest(typicalBaseDir) {
  const cppFiles = sortTypicalFilesAsc(listTypicalCppFiles(typicalBaseDir))
  const problems = cppFiles.map((fileName) => {
    const id = fileName.replace(CPP_FILE_EXTENSION_PATTERN, "")
    return {
      id,
      title: `典型 ${id}`,
      cpp: readTextFile(path.join(typicalBaseDir, fileName)),
      content: "典型90問の解法メモです。",
    }
  })

  return {
    abc: TYPICAL_DIR_NAME,
    summary: "典型90問などの典型問題をまとめたセクションです。",
    problems,
  }
}

/**
 * problems/ 直下のディレクトリを一覧表示用の JSON データに変換する
 * @param {string} [baseRoot]
 * @returns {Contest[]}
 */
function collectProblemsData(baseRoot = path.join(__dirname, "..", "..", "problems")) {
  const results = []

  const abcBaseDir = path.join(baseRoot, ABC_DIR_NAME)
  if (fs.existsSync(abcBaseDir)) {
    for (const dirName of sortAbcDirsDesc(listSubdirectories(abcBaseDir))) {
      const contest = collectAbcContest(abcBaseDir, dirName)
      if (contest) results.push(contest)
    }
  }

  const typicalBaseDir = path.join(baseRoot, TYPICAL_DIR_NAME)
  if (fs.existsSync(typicalBaseDir)) {
    results.push(collectTypicalContest(typicalBaseDir))
  }

  return results
}

/**
 * 集計結果を JSON ファイルへ出力する
 * @param {Contest[]} results
 * @param {string} outputPath
 */
function writeProblemsJson(results, outputPath) {
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8")
}

if (require.main === module) {
  const baseRoot = path.join(__dirname, "..", "..", "problems")
  const results = collectProblemsData(baseRoot)
  const outputPath = path.join(__dirname, "..", "public", "problems.json")
  writeProblemsJson(results, outputPath)

  console.log(`completed tasks. outputed at ${outputPath}`)
}

module.exports = {
  collectProblemsData,
  listSubdirectories,
  listTypicalCppFiles,
  parseReadme,
  sortAbcDirsDesc,
  sortTypicalFilesAsc,
}
