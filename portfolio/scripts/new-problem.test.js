// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("fs")
const os = require("os")
const path = require("path")
const { execFileSync } = require("node:child_process")
const { collectProblemsData } = require("./main")
const {
  buildPlan,
  createProblemDir,
  normalizeContestId,
  parseProblemLetters,
} = require("./new-problem")

const CLI_PATH = path.join(__dirname, "new-problem.js")

function makeTempDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "new-problem-"))
  t.after(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })
  return dir
}

// 既存 problems/ の構造（ABC/）を持った一時ディレクトリを生成する
function makeBaseRoot(t) {
  const dir = makeTempDir(t)
  fs.mkdirSync(path.join(dir, "ABC"), { recursive: true })
  return dir
}

function runCli(baseRoot, args) {
  return execFileSync(process.execPath, [CLI_PATH, ...args, "--base", baseRoot], {
    encoding: "utf8",
  })
}

function runCliFail(baseRoot, args) {
  try {
    execFileSync(process.execPath, [CLI_PATH, ...args, "--base", baseRoot], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
  } catch (err) {
    return { status: err.status, stderr: err.stderr }
  }
  assert.fail("CLI should have exited with non-zero status")
}

test("normalizeContestId: 数字3桁を ABC### に正規化する", () => {
  assert.equal(normalizeContestId("471"), "ABC471")
  assert.equal(normalizeContestId("000"), "ABC000")
  assert.equal(normalizeContestId("999"), "ABC999")
})

test("normalizeContestId: ABC### 形式（大文字・小文字）を正規化する", () => {
  assert.equal(normalizeContestId("ABC471"), "ABC471")
  assert.equal(normalizeContestId("abc471"), "ABC471")
})

test("normalizeContestId: 不正な入力は null を返す", () => {
  const invalidInputs = [
    "",
    "   ",
    "ABC12",
    "ABC1234",
    "abc",
    "ABCABC",
    "ABC47-1",
    "ABC 471",
    "4711",
    "A471",
    "..",
    "/etc/passwd",
    "ABC47\n1",
    "ABC\t471",
  ]
  for (const input of invalidInputs) {
    assert.equal(normalizeContestId(input), null, `input: ${JSON.stringify(input)}`)
  }
})

test("parseProblemLetters: 指定仕様どおりにパースする", () => {
  assert.deepEqual(parseProblemLetters("A-C"), ["A", "B", "C"])
  assert.deepEqual(parseProblemLetters("A,C"), ["A", "C"])
  assert.deepEqual(parseProblemLetters("ABC"), ["A", "B", "C"])
  assert.deepEqual(parseProblemLetters("A-G"), ["A", "B", "C", "D", "E", "F", "G"])
})

test("parseProblemLetters: 重複を除去して A〜G の順に整列する", () => {
  assert.deepEqual(parseProblemLetters("C,A,B"), ["A", "B", "C"])
  assert.deepEqual(parseProblemLetters("A,A,C,C"), ["A", "C"])
  assert.deepEqual(parseProblemLetters("a-c"), ["A", "B", "C"])
})

test("parseProblemLetters: A〜G 以外の指定はエラーになる", () => {
  const invalidInputs = ["H", "A-H", "Z", "1", "ABC-H", "A-B-C", "B-A", "A,,C", ",", "  ", ""]
  for (const input of invalidInputs) {
    assert.throws(() => parseProblemLetters(input), undefined, `input: ${JSON.stringify(input)}`)
  }
})

test("buildPlan: 生成対象のファイル構成を返す", (t) => {
  const baseRoot = makeBaseRoot(t)
  const plan = buildPlan(baseRoot, {
    contestId: "ABC471",
    letters: ["A", "B"],
    summary: null,
    cpp: false,
  })
  assert.equal(plan.targetDir, path.join(baseRoot, "ABC", "ABC471"))
  assert.deepEqual(
    plan.files.map((file) => file.relativePath),
    [path.join("ABC", "ABC471", "README.md")],
  )
})

test("buildPlan: cpp オプションで cpp ファイルが追加される", (t) => {
  const baseRoot = makeBaseRoot(t)
  const plan = buildPlan(baseRoot, {
    contestId: "ABC471",
    letters: ["A", "C"],
    summary: null,
    cpp: true,
  })
  assert.deepEqual(
    plan.files.map((file) => file.relativePath),
    [
      path.join("ABC", "ABC471", "README.md"),
      path.join("ABC", "ABC471", "A.cpp"),
      path.join("ABC", "ABC471", "C.cpp"),
    ],
  )
})

test("buildPlan: 不正なコンテストIDはエラーになる（パストラバーサル防止）", (t) => {
  const baseRoot = makeBaseRoot(t)
  const invalidIds = ["../evil", "..", "ABC", "471", "ABC1234", "", "/etc/passwd"]
  for (const contestId of invalidIds) {
    assert.throws(
      () => buildPlan(baseRoot, { contestId, letters: ["A"], summary: null, cpp: false }),
      undefined,
      `contestId: ${JSON.stringify(contestId)}`,
    )
  }
})

test("createProblemDir: README.md を生成する", (t) => {
  const baseRoot = makeBaseRoot(t)
  createProblemDir(baseRoot, {
    contestId: "ABC471",
    letters: parseProblemLetters("A-G"),
    summary: null,
    cpp: false,
  })
  const readmePath = path.join(baseRoot, "ABC", "ABC471", "README.md")
  assert.ok(fs.existsSync(readmePath))
  const content = fs.readFileSync(readmePath, "utf8")
  assert.ok(content.startsWith("# ABC471\n"))
  for (const letter of ["A", "B", "C", "D", "E", "F", "G"]) {
    assert.ok(content.includes(`## ${letter}問題`), `missing section ${letter}問題`)
  }
  assert.ok(content.includes("（この回の結果や感想を書く）"))
  assert.ok(content.endsWith("\n"))
})

test("createProblemDir: summary が README に反映される", (t) => {
  const baseRoot = makeBaseRoot(t)
  createProblemDir(baseRoot, {
    contestId: "ABC471",
    letters: ["A"],
    summary: "今回は2完",
    cpp: false,
  })
  const content = fs.readFileSync(path.join(baseRoot, "ABC", "ABC471", "README.md"), "utf8")
  assert.ok(content.includes("今回は2完"))
  assert.ok(!content.includes("（この回の結果や感想を書く）"))
})

test("createProblemDir: --problems で絞ったセクションのみ生成する", (t) => {
  const baseRoot = makeBaseRoot(t)
  createProblemDir(baseRoot, {
    contestId: "ABC471",
    letters: parseProblemLetters("A,C"),
    summary: null,
    cpp: false,
  })
  const content = fs.readFileSync(path.join(baseRoot, "ABC", "ABC471", "README.md"), "utf8")
  assert.ok(content.includes("## A問題"))
  assert.ok(content.includes("## C問題"))
  assert.ok(!content.includes("## B問題"))
})

test("createProblemDir: cpp オプションで雛形を生成する", (t) => {
  const baseRoot = makeBaseRoot(t)
  createProblemDir(baseRoot, {
    contestId: "ABC471",
    letters: ["A", "B"],
    summary: null,
    cpp: true,
  })
  const aCpp = fs.readFileSync(path.join(baseRoot, "ABC", "ABC471", "A.cpp"), "utf8")
  assert.ok(aCpp.includes("#include <bits/stdc++.h>"))
  assert.ok(aCpp.includes("int main()"))
})

test("createProblemDir: 既存ディレクトリがある場合はエラーで何も書き込まない", (t) => {
  const baseRoot = makeBaseRoot(t)
  const targetDir = path.join(baseRoot, "ABC", "ABC471")
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, "existing.txt"), "keep", "utf8")

  assert.throws(() =>
    createProblemDir(baseRoot, { contestId: "ABC471", letters: ["A"], summary: null, cpp: false }),
  )
  // 既存ファイルがそのまま残り、新規ファイルは追加されていない
  assert.deepEqual(fs.readdirSync(targetDir), ["existing.txt"])
  assert.equal(fs.readFileSync(path.join(targetDir, "existing.txt"), "utf8"), "keep")
})

test("createProblemDir: 生成先ルートが存在しない場合はエラーになる", (t) => {
  const tmp = makeTempDir(t)
  const missingBase = path.join(tmp, "no-such-dir")
  assert.throws(() =>
    createProblemDir(missingBase, { contestId: "ABC471", letters: ["A"], summary: null, cpp: false }),
  )
})

test("CLI: 471 の形式で生成できる", (t) => {
  const baseRoot = makeBaseRoot(t)
  const stdout = runCli(baseRoot, ["471"])
  assert.ok(stdout.includes("created"))
  assert.ok(fs.existsSync(path.join(baseRoot, "ABC", "ABC471", "README.md")))
})

test("CLI: ABC471 の形式で生成できる", (t) => {
  const baseRoot = makeBaseRoot(t)
  runCli(baseRoot, ["ABC471", "--problems", "ABC"])
  assert.ok(fs.existsSync(path.join(baseRoot, "ABC", "ABC471", "README.md")))
})

test("CLI: --dry-run ではファイルを生成しない", (t) => {
  const baseRoot = makeBaseRoot(t)
  const stdout = runCli(baseRoot, ["ABC471", "--dry-run"])
  assert.ok(stdout.includes("# ABC471"))
  assert.ok(!fs.existsSync(path.join(baseRoot, "ABC", "ABC471")))
})

test("CLI: 既存ディレクトリがある場合はエラーになり上書きしない", (t) => {
  const baseRoot = makeBaseRoot(t)
  runCli(baseRoot, ["471"])
  const result = runCliFail(baseRoot, ["471"])
  assert.equal(result.status, 1)
  assert.ok(result.stderr.includes("既に存在します"))
  // 既存の生成物がそのまま残っている
  assert.ok(fs.existsSync(path.join(baseRoot, "ABC", "ABC471", "README.md")))
})

test("CLI: 不正な入力はエラーになり何も生成しない", (t) => {
  const baseRoot = makeBaseRoot(t)
  for (const bad of ["ABC12", "ABC1234", "abc", "..", "/etc/passwd"]) {
    const result = runCliFail(baseRoot, [bad])
    assert.equal(result.status, 1, `input: ${bad}`)
    assert.ok(result.stderr.includes("Error"), `input: ${bad}`)
  }
  assert.equal(fs.readdirSync(path.join(baseRoot, "ABC")).length, 0)
})

test("CLI: コンテストIDが指定されない場合はエラーになる", (t) => {
  const baseRoot = makeBaseRoot(t)
  const result = runCliFail(baseRoot, [])
  assert.equal(result.status, 1)
  assert.ok(result.stderr.includes("コンテストIDを指定してください"))
})

test("互換性: 生成した README が collectProblemsData でパースできる", (t) => {
  const baseRoot = makeBaseRoot(t)
  createProblemDir(baseRoot, {
    contestId: "ABC471",
    letters: ["A", "B"],
    summary: "テスト用",
    cpp: true,
  })

  const results = collectProblemsData(baseRoot)
  assert.equal(results.length, 1)
  const contest = results[0]
  assert.equal(contest.abc, "ABC471")
  assert.equal(contest.summary, "テスト用")
  assert.deepEqual(
    contest.problems.map((problem) => problem.id),
    ["A", "B"],
  )
  assert.equal(
    contest.problems[0].cpp,
    fs.readFileSync(path.join(baseRoot, "ABC", "ABC471", "A.cpp"), "utf8"),
  )
})
