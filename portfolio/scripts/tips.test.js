// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("fs")
const os = require("os")
const path = require("path")
const {
  collectTip,
  collectTipsData,
  extractTitle,
  listMarkdownFiles,
  listSubdirectories,
  sortNamesAsc,
} = require("./tips")

function makeTipsDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tips-fixture-"))
  t.after(() => {
    fs.rmSync(dir, { recursive: true, force: true })
  })
  return dir
}

test("sortNamesAsc: 文字列の昇順（日本語ロケール）にソートする", () => {
  assert.deepEqual(sortNamesAsc(["う", "あ", "い"]), ["あ", "い", "う"])
})

test("listSubdirectories: サブディレクトリのみ列挙する", (t) => {
  const dir = makeTipsDir(t)
  fs.writeFileSync(path.join(dir, "file.txt"), "x", "utf8")
  fs.mkdirSync(path.join(dir, "dir1"))
  fs.mkdirSync(path.join(dir, "dir2"))
  assert.deepEqual(listSubdirectories(dir).sort(), ["dir1", "dir2"])
})

test("listMarkdownFiles: .md を列挙し README.md を除外する", (t) => {
  const dir = makeTipsDir(t)
  fs.writeFileSync(path.join(dir, "a.md"), "x", "utf8")
  fs.writeFileSync(path.join(dir, "README.md"), "x", "utf8")
  fs.writeFileSync(path.join(dir, "a.cpp"), "x", "utf8")
  assert.deepEqual(listMarkdownFiles(dir).sort(), ["a.md"])
})

test("extractTitle: 先頭の # 見出しを返す", () => {
  assert.equal(extractTitle("# 二分探索\n\n説明\n"), "二分探索")
  assert.equal(extractTitle("説明のみ\n"), "")
})

test("collectTipsData: カテゴリごとに収集し、タイトルを切り出す", (t) => {
  const dir = makeTipsDir(t)
  const catDir = path.join(dir, "典型テクニック")
  fs.mkdirSync(catDir, { recursive: true })
  fs.writeFileSync(
    path.join(catDir, "二分探索.md"),
    "# 二分探索\n\n半開区間 $[l, r)$ を考える。\n",
    "utf8",
  )
  // 説明用の README.md はアイテムとして扱われない
  fs.writeFileSync(path.join(catDir, "README.md"), "説明\n", "utf8")
  // .md のないカテゴリは出力されない
  fs.mkdirSync(path.join(dir, "空カテゴリ"), { recursive: true })

  const expected = [
    {
      category: "典型テクニック",
      items: [{ id: "二分探索", title: "二分探索", content: "半開区間 $[l, r)$ を考える。" }],
    },
  ]

  const results = collectTipsData(dir)
  assert.deepEqual(results, expected)
  // JSON.stringify の整形・フィールド順まで固定する
  assert.equal(JSON.stringify(results, null, 2), JSON.stringify(expected, null, 2))
})

test("collectTipsData: 見出しがない場合は id をタイトルにする", (t) => {
  const dir = makeTipsDir(t)
  const catDir = path.join(dir, "メモ")
  fs.mkdirSync(catDir, { recursive: true })
  fs.writeFileSync(path.join(catDir, "メモ.md"), "本文だけ\n", "utf8")
  const results = collectTipsData(dir)
  assert.equal(results[0].items[0].title, "メモ")
  assert.equal(results[0].items[0].content, "本文だけ")
})

test("collectTipsData: 空の tips/ は空配列を返す", (t) => {
  const dir = makeTipsDir(t)
  assert.deepEqual(collectTipsData(dir), [])
})

test("collectTipsData: ルートが存在しない場合は空配列を返す", (t) => {
  const dir = makeTipsDir(t)
  assert.deepEqual(collectTipsData(path.join(dir, "no-such-dir")), [])
})

test("collectTip: カテゴリ配下の Tips 1 件を読み込む", (t) => {
  const dir = makeTipsDir(t)
  fs.writeFileSync(path.join(dir, "a.md"), "# タイトル\n\n本文\n", "utf8")
  assert.deepEqual(collectTip(dir, "a.md"), { id: "a", title: "タイトル", content: "本文" })
})
