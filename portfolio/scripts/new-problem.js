// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const DEFAULT_BASE_ROOT = path.join(__dirname, "..", "..", "content", "problems")
const CONTEST_ID_PATTERN = /^ABC\d{3}$/
const LETTERS = ["A", "B", "C", "D", "E", "F", "G"]
const VALID_LETTERS = new Set(LETTERS)

const CPP_TEMPLATE = [
  "#include <bits/stdc++.h>",
  "#define rep(i, n) for (int i = 0; i < (n); i++)",
  "using namespace std;",
  "",
  "int main() {",
  "    return 0;",
  "}",
  "",
].join("\n")

// コンテストIDを正規化する。471 -> ABC471、ABC471 / abc471 -> ABC471。
// 形式が正しければ実在確認なしで受理する。不正な入力は null。
function normalizeContestId(input) {
  if (typeof input !== "string") return null
  const trimmed = input.trim()
  if (/^\d{3}$/.test(trimmed)) {
    return `ABC${trimmed}`
  }
  const match = trimmed.match(/^ABC(\d{3})$/i)
  if (match) {
    return `ABC${match[1]}`
  }
  return null
}

// 問題セクションの指定をパースする。
// "A-C" は A,B,C / "A,C" は A,C / "ABC" は A,B,C / "A-G" は A〜G。
// 重複は除去して A〜G の順に整列する。A〜G 以外はエラー。
function parseProblemLetters(input) {
  if (typeof input !== "string" || input.trim() === "") {
    throw new Error("--problems が空です。A〜G で指定してください")
  }
  const letters = []
  const tokens = input.split(",").map((token) => token.trim())
  for (const token of tokens) {
    if (token === "") {
      throw new Error(`--problems に空の要素があります: ${input}`)
    }
    const rangeMatch = token.match(/^([A-Ga-g])-([A-Ga-g])$/)
    if (rangeMatch) {
      const start = rangeMatch[1].toUpperCase()
      const end = rangeMatch[2].toUpperCase()
      const startIndex = LETTERS.indexOf(start)
      const endIndex = LETTERS.indexOf(end)
      if (startIndex > endIndex) {
        throw new Error(`--problems の範囲が逆順です: ${token}`)
      }
      for (let i = startIndex; i <= endIndex; i++) {
        letters.push(LETTERS[i])
      }
    } else {
      for (const char of token.toUpperCase().split("")) {
        if (!VALID_LETTERS.has(char)) {
          throw new Error(`--problems に A〜G 以外の文字が含まれています: ${char} (${token})`)
        }
        letters.push(char)
      }
    }
  }
  return [...new Set(letters)].sort((a, b) => LETTERS.indexOf(a) - LETTERS.indexOf(b))
}

function buildReadme(contestId, letters, summary) {
  const lines = [`# ${contestId}`, "", summary || "（この回の結果や感想を書く）", ""]
  for (const letter of letters) {
    lines.push(`## ${letter}問題`, "", "（AC / WA / 解説AC などを記入）", "", "### 思った事", "")
  }
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop()
  }
  return lines.join("\n") + "\n"
}

function assertValidContestId(contestId) {
  if (typeof contestId !== "string" || !CONTEST_ID_PATTERN.test(contestId)) {
    throw new Error(`不正なコンテストIDです: ${contestId}`)
  }
}

function buildPlan(baseRoot, options) {
  const contestId = options.contestId
  assertValidContestId(contestId)
  const base = path.resolve(baseRoot)
  const targetDir = path.resolve(base, "ABC", contestId)
  // 生成先が base 配下であることを検証する（パストラバーサル対策の最終防壁）
  if (!targetDir.startsWith(base + path.sep)) {
    throw new Error(`生成先が生成ルートの外です: ${targetDir}`)
  }
  const files = [
    {
      relativePath: path.join("ABC", contestId, "README.md"),
      content: buildReadme(contestId, options.letters, options.summary),
    },
  ]
  if (options.cpp) {
    for (const letter of options.letters) {
      files.push({
        relativePath: path.join("ABC", contestId, `${letter}.cpp`),
        content: CPP_TEMPLATE,
      })
    }
  }
  return { base, targetDir, files }
}

function validateNoConflicts(baseRoot, plan) {
  if (!fs.existsSync(baseRoot) || !fs.statSync(baseRoot).isDirectory()) {
    throw new Error(`生成先ルートが存在しません: ${baseRoot}`)
  }
  if (fs.existsSync(plan.targetDir)) {
    throw new Error(`既に存在します: ${plan.targetDir}`)
  }
  for (const file of plan.files) {
    const filePath = path.join(plan.base, file.relativePath)
    if (fs.existsSync(filePath)) {
      throw new Error(`既に存在します: ${filePath}`)
    }
  }
}

function createProblemDir(baseRoot, options) {
  const plan = buildPlan(baseRoot, options)
  validateNoConflicts(baseRoot, plan)
  fs.mkdirSync(plan.targetDir, { recursive: true })
  for (const file of plan.files) {
    fs.writeFileSync(path.join(plan.base, file.relativePath), file.content, "utf8")
  }
  return plan
}

function parseArgs(argv) {
  const args = {
    contestIdInput: null,
    problems: "A-G",
    summary: null,
    cpp: false,
    dryRun: false,
    baseRoot: null,
    help: false,
  }
  let i = 0
  while (i < argv.length) {
    const arg = argv[i]
    const takeValue = () => {
      if (i + 1 >= argv.length) {
        throw new Error(`${arg} には値が必要です`)
      }
      i++
      return argv[i]
    }
    if (arg === "--help" || arg === "-h") {
      args.help = true
    } else if (arg === "--cpp") {
      args.cpp = true
    } else if (arg === "--dry-run" || arg === "-d") {
      args.dryRun = true
    } else if (arg === "--problems" || arg === "-p") {
      args.problems = takeValue()
    } else if (arg === "--summary" || arg === "-s") {
      args.summary = takeValue()
    } else if (arg === "--base") {
      args.baseRoot = takeValue()
    } else if (arg.startsWith("--") && arg.includes("=")) {
      const eq = arg.indexOf("=")
      const key = arg.slice(0, eq)
      const value = arg.slice(eq + 1)
      if (key === "--problems") {
        args.problems = value
      } else if (key === "--summary") {
        args.summary = value
      } else if (key === "--base") {
        args.baseRoot = value
      } else {
        throw new Error(`不明なオプションです: ${arg}`)
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      throw new Error(`不明なオプションです: ${arg}`)
    } else {
      if (args.contestIdInput !== null) {
        throw new Error(`コンテストIDの指定が多すぎます: ${arg}`)
      }
      args.contestIdInput = arg
    }
    i++
  }
  return args
}

function printUsage() {
  console.log(`使い方:
  node scripts/new-problem.js <コンテストID> [オプション]

引数:
  コンテストID   ABC471 または 471 の形式。形式が正しければ実在確認なしで受理します。

オプション:
  -p, --problems <文字列>  生成する問題セクション（デフォルト: A-G）
                           A-C は A,B,C / A,C は A,C / ABC は A,B,C / A-G は A〜G。
                           重複は除去し、A〜G 以外はエラー。
  -s, --summary <テキスト>  README の感想欄の初期テキスト
      --cpp                A.cpp〜G.cpp の雛形も生成します（デフォルトでは生成しません）
  -d, --dry-run            ファイルを作成せず、生成予定の内容を表示します
      --base <ディレクトリ>  生成先ルートを差し替えます（主にテスト用）
  -h, --help               このヘルプを表示します`)
}

function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printUsage()
    return 0
  }
  if (args.contestIdInput === null) {
    throw new Error("コンテストIDを指定してください（例: ABC471 / 471）")
  }
  const contestId = normalizeContestId(args.contestIdInput)
  if (!contestId) {
    throw new Error(`不正なコンテストIDです: ${args.contestIdInput}`)
  }
  const letters = parseProblemLetters(args.problems)
  const baseRoot = path.resolve(args.baseRoot || DEFAULT_BASE_ROOT)
  const options = { contestId, letters, summary: args.summary, cpp: args.cpp }

  if (args.dryRun) {
    const plan = buildPlan(baseRoot, options)
    console.log(`生成予定: ${plan.targetDir}`)
    for (const file of plan.files) {
      console.log(`\n--- ${file.relativePath} ---`)
      console.log(file.content)
    }
    return 0
  }

  const plan = createProblemDir(baseRoot, options)
  console.log(`created: ${plan.targetDir}`)
  return 0
}

if (require.main === module) {
  try {
    process.exitCode = main()
  } catch (err) {
    console.error(`Error: ${err.message}`)
    process.exitCode = 1
  }
}

module.exports = {
  DEFAULT_BASE_ROOT,
  LETTERS,
  buildPlan,
  createProblemDir,
  normalizeContestId,
  parseProblemLetters,
}
