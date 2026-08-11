// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("fs")
const os = require("os")
const path = require("path")
const {
  collectLibraryData,
  listMarkdownFiles,
  listSubdirectories,
  sortNamesAsc,
} = require("./library")

function makeLibraryDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "library-fixture-"))
  t.after(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })
  return dir
}

test("sortNamesAsc: 文字列の昇順（日本語ロケール）にソートする", () => {
  assert.deepEqual(sortNamesAsc(["う", "あ", "い"]), ["あ", "い", "う"])
  assert.deepEqual(sortNamesAsc(["b.md", "a.md", "c.md"]), ["a.md", "b.md", "c.md"])
})

test("listSubdirectories: サブディレクトリのみ列挙する", (t) => {
  const lib = makeLibraryDir(t)
  fs.writeFileSync(path.join(lib, "file.txt"), "x", "utf8")
  fs.mkdirSync(path.join(lib, "dir1"))
  fs.mkdirSync(path.join(lib, "dir2"))
  assert.deepEqual(listSubdirectories(lib).sort(), ["dir1", "dir2"])
})

test("listMarkdownFiles: .md を列挙し README.md を除外する", (t) => {
  const lib = makeLibraryDir(t)
  fs.writeFileSync(path.join(lib, "a.md"), "x", "utf8")
  fs.writeFileSync(path.join(lib, "README.md"), "x", "utf8")
  fs.writeFileSync(path.join(lib, "a.cpp"), "x", "utf8")
  assert.deepEqual(listMarkdownFiles(lib).sort(), ["a.md"])
})

test("collectLibraryData: カテゴリとアイテムを解析する", (t) => {
  const lib = makeLibraryDir(t)

  const graphDir = path.join(lib, "グラフ")
  fs.mkdirSync(graphDir, { recursive: true })
  fs.writeFileSync(
    path.join(graphDir, "ダイクストラ.md"),
    "# ダイクストラ\n\n単一始点最短路\n",
    "utf8",
  )
  fs.writeFileSync(path.join(graphDir, "ダイクストラ.cpp"), "int main() {}\n", "utf8")
  // cpp なしのアイテム
  fs.writeFileSync(path.join(graphDir, "ワーシャルフロイド.md"), "# ワーシャルフロイド\n", "utf8")
  // カテゴリ説明用の README.md はアイテムとして扱われない
  fs.writeFileSync(path.join(graphDir, "README.md"), "グラフアルゴリズムの説明\n", "utf8")

  // .md のないカテゴリは出力されない
  fs.mkdirSync(path.join(lib, "データ構造"), { recursive: true })

  const expected = [
    {
      category: "グラフ",
      items: [
        { id: "ダイクストラ", title: "ダイクストラ", content: "# ダイクストラ\n\n単一始点最短路", cpp: "int main() {}\n" },
        { id: "ワーシャルフロイド", title: "ワーシャルフロイド", content: "# ワーシャルフロイド", cpp: "" },
      ],
    },
  ]

  const results = collectLibraryData(lib)
  assert.deepEqual(results, expected)
  // JSON.stringify の整形・フィールド順まで固定する
  assert.equal(JSON.stringify(results, null, 2), JSON.stringify(expected, null, 2))
})

test("collectLibraryData: cpp がないアイテムは cpp が空文字になる", (t) => {
  const lib = makeLibraryDir(t)
  const catDir = path.join(lib, "数え上げ")
  fs.mkdirSync(catDir, { recursive: true })
  fs.writeFileSync(path.join(catDir, "包除原理.md"), "# 包除原理\n", "utf8")

  const results = collectLibraryData(lib)
  assert.equal(results[0].items[0].cpp, "")
})

test("collectLibraryData: README.md のみのカテゴリは出力しない", (t) => {
  const lib = makeLibraryDir(t)
  const catDir = path.join(lib, "空カテゴリ")
  fs.mkdirSync(catDir, { recursive: true })
  fs.writeFileSync(path.join(catDir, "README.md"), "このカテゴリの説明\n", "utf8")

  assert.deepEqual(collectLibraryData(lib), [])
})

test("collectLibraryData: 空の library/ は空配列を返す", (t) => {
  const lib = makeLibraryDir(t)
  assert.deepEqual(collectLibraryData(lib), [])
})

test("collectLibraryData: ルートが存在しない場合は空配列を返す", (t) => {
  const tmp = makeLibraryDir(t)
  assert.deepEqual(collectLibraryData(path.join(tmp, "no-such-dir")), [])
})
