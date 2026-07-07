const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("fs")
const os = require("os")
const path = require("path")
const { collectProblemsData } = require("./main")

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
