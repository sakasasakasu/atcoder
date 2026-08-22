// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")
const { listSubdirectories, readTextFile, sortNamesAsc, writeJson } = require("./fs-utils")

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
 * @property {import("./common").CodeFile[]} codes
 * @property {string} content
 * @property {import("./mentions").MentionRef[]} mentions
 * @property {import("./mentions").MentionRef[]} referencedBy
 */

/**
 * @typedef {Object} Contest
 * @property {string} abc
 * @property {string} summary
 * @property {boolean} flat 典型形式（直下の .cpp = 1 問題）なら true
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
 * ある問題（例: A）に紐づくコードファイル一覧を読み込む。
 * `A.cpp`, `A1.cpp`, `A2.cpp` のような「問題ID で始まる .cpp」を全て拾う。
 * @param {string} dir
 * @param {string} problemId
 * @returns {import("./common").CodeFile[]}
 */
function listProblemCodeFiles(dir, problemId) {
  return fs
    .readdirSync(dir)
    .filter(
      (file) =>
        file.endsWith(CPP_FILE_EXTENSION) &&
        file !== "main.cpp" &&
        file.startsWith(problemId),
    )
    .sort()
    .map((fileName) => ({
      name: fileName.replace(CPP_FILE_EXTENSION_PATTERN, ""),
      code: readTextFile(path.join(dir, fileName)),
    }))
}

/**
 * コンテストディレクトリ名を降順にソートする（例: ABC471 → ABC470）
 * @param {string[]} names
 * @returns {string[]}
 */
function sortContestDirsDesc(names) {
  return [...names].sort((a, b) => (a > b ? -1 : 1))
}

/**
 * 典型問題のファイル名を数値昇順にソートする（既存仕様を維持）
 * @param {string[]} names
 * @returns {string[]}
 */

/**
 * 典型問題のファイル名を数値昇順にソートする（既存仕様を維持）
 * @param {string[]} names
 * @returns {string[]}
 */
function sortTypicalFilesAsc(names) {
  return [...names].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
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
 * コンテスト 1 件分のデータを読み込む。
 * セクション直下のサブディレクトリ（例: ABC471）の README.md をパースする。
 * README.md がない場合は null を返す（既存仕様: 静かにスキップ）
 * @param {string} sectionDir
 * @param {string} dirName
 * @returns {Contest | null}
 */
function collectContest(sectionDir, dirName) {
  const dirPath = path.join(sectionDir, dirName)
  const readmePath = path.join(dirPath, README_FILE_NAME)
  if (!fs.existsSync(readmePath)) return null

  const parsed = parseReadme(readTextFile(readmePath))
  const problems = parsed.sections.map((section) => ({
    id: section.id,
    title: `${section.id}問題`,
    codes: listProblemCodeFiles(dirPath, section.id),
    content: section.content,
    mentions: [],
    referencedBy: [],
  }))

  return {
    abc: dirName,
    summary: parsed.summary,
    flat: false,
    problems,
  }
}

/**
 * 典型形式セクション 1 件分のデータを読み込む。
 * セクション直下の .cpp ファイルを 1 ファイル = 1 問題として扱う。
 * @param {string} sectionDir
 * @param {string} sectionName
 * @returns {Contest}
 */
function collectFlatSection(sectionDir, sectionName) {
  const cppFiles = sortTypicalFilesAsc(listTypicalCppFiles(sectionDir))
  const problems = cppFiles.map((fileName) => {
    const id = fileName.replace(CPP_FILE_EXTENSION_PATTERN, "")
    return {
      id,
      title: `${sectionName} ${id}`,
      codes: [{ name: id, code: readTextFile(path.join(sectionDir, fileName)) }],
      content: `${sectionName}の問題メモです。`,
      mentions: [],
      referencedBy: [],
    }
  })

  return {
    abc: sectionName,
    summary: `${sectionName}の問題をまとめたセクションです。`,
    flat: true,
    problems,
  }
}

/**
 * problems/ 直下のセクションを一覧表示用の JSON データに変換する。
 * - サブディレクトリがあるセクション → コンテスト形式（各サブディレクトリ = 1 コンテスト）
 * - 直下に .cpp があるセクション → 典型形式（1 ファイル = 1 問題）
 * @param {string} [baseRoot]
 * @returns {Contest[]}
 */
function collectProblemsData(baseRoot = path.join(__dirname, "..", "..", "content", "problems")) {
  const results = []

  for (const sectionName of sortNamesAsc(listSubdirectories(baseRoot))) {
    const sectionDir = path.join(baseRoot, sectionName)
    // README.md を持つサブディレクトリだけをコンテストと判定する
    // （典型形式のセクション内に無関係なサブディレクトリがあっても壊れないように）
    const contestDirs = listSubdirectories(sectionDir).filter((dirName) =>
      fs.existsSync(path.join(sectionDir, dirName, README_FILE_NAME)),
    )

    if (contestDirs.length > 0) {
      // コンテスト形式
      for (const contestName of sortContestDirsDesc(contestDirs)) {
        const contest = collectContest(sectionDir, contestName)
        if (contest) results.push(contest)
      }
    } else if (listTypicalCppFiles(sectionDir).length > 0) {
      // 典型形式
      results.push(collectFlatSection(sectionDir, sectionName))
    }
  }

  return results
}

/**
 * 集計結果を JSON ファイルへ出力する
 * @param {Contest[]} results
 * @param {string} outputPath
 */
function writeProblemsJson(results, outputPath) {
  writeJson(results, outputPath)
}

if (require.main === module) {
  const baseRoot = path.join(__dirname, "..", "..", "content", "problems")
  const results = collectProblemsData(baseRoot)
  const outputPath = path.join(__dirname, "..", "public", "problems.json")
  writeProblemsJson(results, outputPath)

  console.log(`completed tasks. outputed at ${outputPath}`)
}

module.exports = {
  collectContest,
  collectFlatSection,
  collectProblemsData,
  listProblemCodeFiles,
  listSubdirectories,
  listTypicalCppFiles,
  parseReadme,
  sortContestDirsDesc,
  sortNamesAsc,
  sortTypicalFilesAsc,
  writeProblemsJson,
}
