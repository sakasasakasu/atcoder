// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("fs")
const os = require("os")
const path = require("path")
const {
  collectProblemsData,
  listProblemCodeFiles,
  listSubdirectories,
  listTypicalCppFiles,
  parseReadme,
  sortAbcDirsDesc,
  sortTypicalFilesAsc,
} = require("./main")

test("collectProblemsData includes typical problems", () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "problems-"))

  const abcDir = path.join(tempDir, "ABC", "ABC001")
  fs.mkdirSync(abcDir, { recursive: true })
  fs.writeFileSync(path.join(abcDir, "README.md"), "# ABC001\n\n## A問題\n\n説明\n", "utf8")
  fs.writeFileSync(path.join(abcDir, "A.cpp"), "int main() {}\n", "utf8")

  const typicalDir = path.join(tempDir, "典型")
  fs.mkdirSync(typicalDir, { recursive: true })
  fs.writeFileSync(path.join(typicalDir, "002.cpp"), "#include <bits/stdc++.h>\n", "utf8")
  fs.writeFileSync(path.join(typicalDir, "004.cpp"), "int main() {}\n", "utf8")

  const results = collectProblemsData(tempDir)

  assert.ok(results.some((contest) => contest.abc === "典型"))
  const typicalContest = results.find((contest) => contest.abc === "典型")
  assert.ok(typicalContest)
  assert.equal(typicalContest.problems.length, 2)
  assert.equal(typicalContest.problems[0].title, "典型 002")
})

function makeFixtureDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "main-fixture-"))
  t.after(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })
  return dir
}

function writeProblemFile(baseRoot, contestId, fileName, content) {
  const dirPath = path.join(baseRoot, "ABC", contestId)
  fs.mkdirSync(dirPath, { recursive: true })
  fs.writeFileSync(path.join(dirPath, fileName), content, "utf8")
}

test("互換性: fixture の全体出力が既存 JSON 形式と一致する", (t) => {
  const fixture = makeFixtureDir(t)

  // ABC003: 正常（summary + A.cpp）
  writeProblemFile(fixture, "ABC003", "README.md", "# ABC003\n\n2完\n\n## A問題\n\nAC\n\n### 思った事\n\n")
  writeProblemFile(fixture, "ABC003", "A.cpp", "int main() {}\n")
  // ABC002: README はあるがセクションなし
  writeProblemFile(fixture, "ABC002", "README.md", "# ABC002\n\n感想のみ\n")
  // ABC001: README なし → スキップされる
  writeProblemFile(fixture, "ABC001", "A.cpp", "int main() {}\n")

  const typicalDir = path.join(fixture, "典型")
  fs.mkdirSync(typicalDir, { recursive: true })
  fs.writeFileSync(path.join(typicalDir, "010.cpp"), "code10\n", "utf8")
  fs.writeFileSync(path.join(typicalDir, "002.cpp"), "code2\n", "utf8")
  fs.writeFileSync(path.join(typicalDir, "main.cpp"), "scratch\n", "utf8") // 除外対象
  fs.mkdirSync(path.join(typicalDir, "サブ"), { recursive: true }) // 無視される

  const expected = [
    {
      abc: "ABC003",
      summary: "2完",
      problems: [
        {
          id: "A",
          title: "A問題",
          codes: [{ name: "A", code: "int main() {}\n" }],
          content: "AC\n\n### 思った事",
          mentions: [],
          referencedBy: [],
        },
      ],
    },
    {
      abc: "ABC002",
      summary: "感想のみ",
      problems: [],
    },
    {
      abc: "典型",
      summary: "典型90問などの典型問題をまとめたセクションです。",
      problems: [
        {
          id: "002",
          title: "典型 002",
          codes: [{ name: "002", code: "code2\n" }],
          content: "典型90問の解法メモです。",
          mentions: [],
          referencedBy: [],
        },
        {
          id: "010",
          title: "典型 010",
          codes: [{ name: "010", code: "code10\n" }],
          content: "典型90問の解法メモです。",
          mentions: [],
          referencedBy: [],
        },
      ],
    },
  ]

  const results = collectProblemsData(fixture)
  assert.deepEqual(results, expected)
  // JSON.stringify の整形・フィールド順まで既存仕様を固定する
  assert.equal(JSON.stringify(results, null, 2), JSON.stringify(expected, null, 2))
})

test("ABCディレクトリは降順で出力される", (t) => {
  const fixture = makeFixtureDir(t)
  writeProblemFile(fixture, "ABC100", "README.md", "# ABC100\n")
  writeProblemFile(fixture, "ABC900", "README.md", "# ABC900\n")
  writeProblemFile(fixture, "ABC050", "README.md", "# ABC050\n")

  const results = collectProblemsData(fixture)
  assert.deepEqual(
    results.map((contest) => contest.abc),
    ["ABC900", "ABC100", "ABC050"],
  )
})

test("README.md がないディレクトリは出力に含まれない", (t) => {
  const fixture = makeFixtureDir(t)
  writeProblemFile(fixture, "ABC001", "A.cpp", "int main() {}\n")

  const results = collectProblemsData(fixture)
  assert.deepEqual(results, [])
})

test("README.md はあるがセクションがない場合は problems: [] の contest が出力される", (t) => {
  const fixture = makeFixtureDir(t)
  writeProblemFile(fixture, "ABC001", "README.md", "# ABC001\n\n感想のみ\n")

  const results = collectProblemsData(fixture)
  assert.equal(results.length, 1)
  assert.equal(results[0].abc, "ABC001")
  assert.equal(results[0].summary, "感想のみ")
  assert.deepEqual(results[0].problems, [])
})

test("cpp ファイルがない問題は codes が空配列になる", (t) => {
  const fixture = makeFixtureDir(t)
  writeProblemFile(fixture, "ABC001", "README.md", "# ABC001\n\n## A問題\n\nAC\n")

  const results = collectProblemsData(fixture)
  assert.deepEqual(results[0].problems[0].codes, [])
})

test("1 問題に複数のコードがある場合は全て codes に含まれる", (t) => {
  const fixture = makeFixtureDir(t)
  writeProblemFile(fixture, "ABC001", "README.md", "# ABC001\n\n## A問題\n\nAC\n")
  writeProblemFile(fixture, "ABC001", "A.cpp", "codeA\n")
  writeProblemFile(fixture, "ABC001", "A1.cpp", "codeA1\n")
  // 別問題のコード（B）は A には紐づかない
  writeProblemFile(fixture, "ABC001", "B.cpp", "codeB\n")

  const results = collectProblemsData(fixture)
  assert.deepEqual(results[0].problems[0].codes, [
    { name: "A", code: "codeA\n" },
    { name: "A1", code: "codeA1\n" },
  ])
})

test("listProblemCodeFiles: 問題ID で始まる .cpp を名前昇順で返す", (t) => {
  const fixture = makeFixtureDir(t)
  fs.writeFileSync(path.join(fixture, "A1.cpp"), "codeA1\n")
  fs.writeFileSync(path.join(fixture, "A.cpp"), "codeA\n")
  fs.writeFileSync(path.join(fixture, "B.cpp"), "codeB\n")
  fs.writeFileSync(path.join(fixture, "main.cpp"), "scratch\n")

  assert.deepEqual(listProblemCodeFiles(fixture, "A"), [
    { name: "A", code: "codeA\n" },
    { name: "A1", code: "codeA1\n" },
  ])
})

test("典型問題は数値昇順で main.cpp とディレクトリを除外する", (t) => {
  const fixture = makeFixtureDir(t)
  const typicalDir = path.join(fixture, "典型")
  fs.mkdirSync(typicalDir, { recursive: true })
  fs.writeFileSync(path.join(typicalDir, "010.cpp"), "code10\n", "utf8")
  fs.writeFileSync(path.join(typicalDir, "2.cpp"), "code2\n", "utf8")
  fs.writeFileSync(path.join(typicalDir, "main.cpp"), "scratch\n", "utf8")
  fs.writeFileSync(path.join(typicalDir, "README.md"), "ignored\n", "utf8")

  const results = collectProblemsData(fixture)
  const typicalContest = results.find((contest) => contest.abc === "典型")
  assert.deepEqual(
    typicalContest.problems.map((problem) => problem.id),
    ["2", "010"],
  )
})

test("空の problems/ ルートでは空配列を返す", (t) => {
  const fixture = makeFixtureDir(t)
  assert.deepEqual(collectProblemsData(fixture), [])
})

test("parseReadme: summary と問題セクションを解析する", () => {
  const parsed = parseReadme(
    "# ABC001\n\n2完\n\n## A問題\n\nAC\n\n### 思った事\n\n## B問題\n\n解説AC\n",
  )
  assert.equal(parsed.summary, "2完")
  assert.deepEqual(parsed.sections, [
    { id: "A", content: "AC\n\n### 思った事" },
    { id: "B", content: "解説AC" },
  ])
})

test("parseReadme: セクションがない場合は空配列を返す", () => {
  const parsed = parseReadme("# ABC001\n\n感想のみ\n")
  assert.equal(parsed.summary, "感想のみ")
  assert.deepEqual(parsed.sections, [])
})

test("parseReadme: # ヘッダがない場合は全文が summary になる", () => {
  const parsed = parseReadme("感想のみ\n")
  assert.equal(parsed.summary, "感想のみ")
  assert.deepEqual(parsed.sections, [])
})

test("parseReadme: summary が空文字になるケース", () => {
  const parsed = parseReadme("# ABC001\n\n## A問題\n\nAC\n")
  assert.equal(parsed.summary, "")
})

test("parseReadme: 問題セクションの body から見出しが除去される", () => {
  const parsed = parseReadme("# ABC001\n\n## A問題\n\nAC\n\n### 思った事\n\n")
  assert.deepEqual(parsed.sections, [{ id: "A", content: "AC\n\n### 思った事" }])
})

test("sortAbcDirsDesc: 降順にソートし入力配列を破壊しない", () => {
  assert.deepEqual(sortAbcDirsDesc(["ABC100", "ABC900", "ABC050"]), ["ABC900", "ABC100", "ABC050"])
  assert.deepEqual(sortAbcDirsDesc(["ABC000", "ABC999"]), ["ABC999", "ABC000"])
  const input = ["ABC100", "ABC900"]
  sortAbcDirsDesc(input)
  assert.deepEqual(input, ["ABC100", "ABC900"])
})

test("sortTypicalFilesAsc: 数値昇順にソートする", () => {
  assert.deepEqual(sortTypicalFilesAsc(["10.cpp", "2.cpp"]), ["2.cpp", "10.cpp"])
  assert.deepEqual(sortTypicalFilesAsc(["100.cpp", "20.cpp", "3.cpp"]), ["3.cpp", "20.cpp", "100.cpp"])
})

test("listSubdirectories: サブディレクトリのみ列挙する", (t) => {
  const fixture = makeFixtureDir(t)
  fs.writeFileSync(path.join(fixture, "file.txt"), "x", "utf8")
  fs.mkdirSync(path.join(fixture, "dir1"))
  fs.mkdirSync(path.join(fixture, "dir2"))
  assert.deepEqual(listSubdirectories(fixture).sort(), ["dir1", "dir2"])
})

test("listTypicalCppFiles: .cpp のみ列挙し main.cpp を除外する", (t) => {
  const fixture = makeFixtureDir(t)
  fs.writeFileSync(path.join(fixture, "001.cpp"), "c", "utf8")
  fs.writeFileSync(path.join(fixture, "main.cpp"), "c", "utf8")
  fs.writeFileSync(path.join(fixture, "README.md"), "c", "utf8")
  fs.mkdirSync(path.join(fixture, "sub"))
  assert.deepEqual(listTypicalCppFiles(fixture).sort(), ["001.cpp"])
})
