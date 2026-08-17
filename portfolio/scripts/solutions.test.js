// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("fs")
const os = require("os")
const path = require("path")
const {
  collectSolution,
  collectSolutionsData,
  extractTitle,
  listMarkdownFiles,
  listSubdirectories,
  sortNamesAsc,
} = require("./solutions")

function makeSolutionsDir(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "solutions-fixture-"))
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
  const dir = makeSolutionsDir(t)
  fs.writeFileSync(path.join(dir, "file.txt"), "x", "utf8")
  fs.mkdirSync(path.join(dir, "dir1"))
  fs.mkdirSync(path.join(dir, "dir2"))
  assert.deepEqual(listSubdirectories(dir).sort(), ["dir1", "dir2"])
})

test("listMarkdownFiles: .md を列挙し README.md を除外する", (t) => {
  const dir = makeSolutionsDir(t)
  fs.writeFileSync(path.join(dir, "a.md"), "x", "utf8")
  fs.writeFileSync(path.join(dir, "README.md"), "x", "utf8")
  fs.writeFileSync(path.join(dir, "a.cpp"), "x", "utf8")
  assert.deepEqual(listMarkdownFiles(dir).sort(), ["a.md"])
})

test("extractTitle: 先頭の # 見出しを返す", () => {
  assert.equal(extractTitle("# ダイクストラ法\n\n説明\n"), "ダイクストラ法")
  assert.equal(extractTitle("説明のみ\n"), "")
})

test("collectSolutionsData: カテゴリごとに収集し、タイトルを切り出す", (t) => {
  const dir = makeSolutionsDir(t)
  const graphDir = path.join(dir, "グラフ")
  fs.mkdirSync(graphDir, { recursive: true })
  fs.writeFileSync(
    path.join(graphDir, "ダイクストラ法.md"),
    "# ダイクストラ法\n\n単一始点最短路\n",
    "utf8",
  )
  fs.writeFileSync(path.join(graphDir, "ダイクストラ法.cpp"), "int main() {}\n", "utf8")
  // カテゴリ説明用の README.md はアイテムとして扱われない
  fs.writeFileSync(path.join(graphDir, "README.md"), "説明\n", "utf8")

  // .md のないカテゴリは出力されない
  fs.mkdirSync(path.join(dir, "空カテゴリ"), { recursive: true })

  const expected = [
    {
      category: "グラフ",
      items: [
        {
          id: "ダイクストラ法",
          title: "ダイクストラ法",
          content: "単一始点最短路",
          codes: [{ name: "ダイクストラ法", code: "int main() {}\n" }],
          mentions: [],
          referencedBy: [],
        },
      ],
    },
  ]

  const results = collectSolutionsData(dir)
  assert.deepEqual(results, expected)
  // JSON.stringify の整形・フィールド順まで固定する
  assert.equal(JSON.stringify(results, null, 2), JSON.stringify(expected, null, 2))
})

test("collectSolutionsData: 見出しがない場合は id をタイトルにする", (t) => {
  const dir = makeSolutionsDir(t)
  const catDir = path.join(dir, "メモ")
  fs.mkdirSync(catDir, { recursive: true })
  fs.writeFileSync(path.join(catDir, "メモ.md"), "本文だけ\n", "utf8")
  const results = collectSolutionsData(dir)
  assert.equal(results[0].items[0].title, "メモ")
  assert.equal(results[0].items[0].content, "本文だけ")
})

test("collectSolutionsData: cpp がなければ codes は空配列になる", (t) => {
  const dir = makeSolutionsDir(t)
  const catDir = path.join(dir, "メモ")
  fs.mkdirSync(catDir, { recursive: true })
  fs.writeFileSync(path.join(catDir, "メモ.md"), "# メモ\n", "utf8")
  assert.deepEqual(collectSolutionsData(dir)[0].items[0].codes, [])
})

test("collectSolutionsData: 空の solutions/ は空配列を返す", (t) => {
  const dir = makeSolutionsDir(t)
  assert.deepEqual(collectSolutionsData(dir), [])
})

test("collectSolutionsData: ルートが存在しない場合は空配列を返す", (t) => {
  const dir = makeSolutionsDir(t)
  assert.deepEqual(collectSolutionsData(path.join(dir, "no-such-dir")), [])
})

test("collectSolution: カテゴリ配下の解法 1 件を読み込む", (t) => {
  const dir = makeSolutionsDir(t)
  fs.writeFileSync(path.join(dir, "a.md"), "# タイトル\n\n本文\n", "utf8")
  const result = collectSolution(dir, "a.md")
  assert.deepEqual(result, {
    id: "a",
    title: "タイトル",
    content: "本文",
    codes: [],
    mentions: [],
    referencedBy: [],
  })
})

