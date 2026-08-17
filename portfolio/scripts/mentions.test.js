// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const test = require("node:test")
const assert = require("node:assert/strict")
const {
  applyCrossReferences,
  buildProblemIndex,
  buildSolutionIndex,
  extractMentionIds,
  resolveMention,
  resolveMentionsInContent,
} = require("./mentions")

// テスト用のデータ
function makeProblems() {
  return [
    {
      abc: "ABC471",
      summary: "2完",
      flat: false,
      problems: [
        {
          id: "A",
          title: "A問題",
          codes: [],
          content: "AC\n\n[[ダイクストラ法]] を参照",
          mentions: [],
          referencedBy: [],
        },
        {
          id: "B",
          title: "B問題",
          codes: [],
          content: "解説AC",
          mentions: [],
          referencedBy: [],
        },
      ],
    },
    {
      abc: "典型",
      summary: "",
      flat: true,
      problems: [
        {
          id: "002",
          title: "典型 002",
          codes: [],
          content: "典型90問",
          mentions: [],
          referencedBy: [],
        },
      ],
    },
  ]
}

function makeSolutions() {
  return [
    {
      category: "典型テクニック",
      items: [
        {
          id: "ダイクストラ法",
          title: "ダイクストラ法",
          content: "[[ABC471-A]] で使った",
          codes: [],
          mentions: [],
          referencedBy: [],
        },
        {
          id: "しゃくとり法",
          title: "しゃくとり法",
          content: "区間の伸縮",
          codes: [],
          mentions: [],
          referencedBy: [],
        },
      ],
    },
  ]
}

test("extractMentionIds: [[id]] を重複なしで抽出する", () => {
  assert.deepEqual(
    extractMentionIds("[[ABC471-A]] と [[ダイクストラ法]] と [[ABC471-A]]"),
    ["ABC471-A", "ダイクストラ法"],
  )
})

test("resolveMention: 問題はページ種別に応じた href になる", () => {
  const index = { problems: buildProblemIndex(makeProblems()), solutions: new Map() }
  // ホームページ（問題側）表示: 同一ページのアンカー
  assert.deepEqual(resolveMention("ABC471-A", index, "problem"), {
    id: "ABC471-A",
    label: "ABC471 A問題",
    href: "#ABC471-A",
  })
  // 解法ページ表示: basePath 込みの絶対パス
  assert.deepEqual(resolveMention("ABC471-A", index, "solution"), {
    id: "ABC471-A",
    label: "ABC471 A問題",
    href: "/atcoder/#ABC471-A",
  })
  // 典型問題のラベルは title をそのまま使う
  assert.equal(resolveMention("典型-002", index, "problem").label, "典型 002")
})

test("resolveMention: 解法はページ種別に応じた href になる", () => {
  const index = { problems: new Map(), solutions: buildSolutionIndex(makeSolutions()) }
  assert.deepEqual(resolveMention("ダイクストラ法", index, "problem"), {
    id: "ダイクストラ法",
    label: "ダイクストラ法",
    href: "/atcoder/solution#ダイクストラ法",
  })
  assert.deepEqual(resolveMention("ダイクストラ法", index, "solution"), {
    id: "ダイクストラ法",
    label: "ダイクストラ法",
    href: "#ダイクストラ法",
  })
})

test("resolveMention: 不明な ID は null を返す", () => {
  const index = {
    problems: buildProblemIndex(makeProblems()),
    solutions: buildSolutionIndex(makeSolutions()),
  }
  assert.equal(resolveMention("存在しない", index, "problem"), null)
})

test("resolveMentionsInContent: 解決済みはリンク化し未解決は残す", () => {
  const index = {
    problems: buildProblemIndex(makeProblems()),
    solutions: buildSolutionIndex(makeSolutions()),
  }
  const result = resolveMentionsInContent("[[ABC471-A]] と [[不明]]", index, "solution")
  assert.equal(result.content, "[ABC471 A問題](/atcoder/#ABC471-A) と [[不明]]")
  assert.deepEqual(result.mentions, [
    { id: "ABC471-A", label: "ABC471 A問題", href: "/atcoder/#ABC471-A" },
  ])
  assert.deepEqual(result.unresolved, ["不明"])
})

test("resolveMentionsInContent: コードスパン・コードブロック内の言及は変換しない", () => {
  const index = {
    problems: buildProblemIndex(makeProblems()),
    solutions: buildSolutionIndex(makeSolutions()),
  }
  const content =
    "`[[ABC471-A]]` と\n```cpp\n[[ABC471-A]]\n```\nそして [[ABC471-A]]"
  const result = resolveMentionsInContent(content, index, "problem")
  assert.equal(
    result.content,
    "`[[ABC471-A]]` と\n```cpp\n[[ABC471-A]]\n```\nそして [ABC471 A問題](#ABC471-A)",
  )
  assert.deepEqual(result.mentions, [
    { id: "ABC471-A", label: "ABC471 A問題", href: "#ABC471-A" },
  ])
})

test("applyCrossReferences: 前方リンクとバックリンクが相互に付く", () => {
  const result = applyCrossReferences(makeProblems(), makeSolutions())

  // 問題側: ダイクストラ法 への言及がホームページ基準のリンクになる
  const problemA = result.contests[0].problems[0]
  assert.ok(problemA.content.includes("[ダイクストラ法](/atcoder/solution#ダイクストラ法)"))
  assert.deepEqual(problemA.mentions, [
    { id: "ダイクストラ法", label: "ダイクストラ法", href: "/atcoder/solution#ダイクストラ法" },
  ])

  // 解法側: ABC471-A への言及が解法ページ基準のリンクになる
  const dijkstra = result.solutions[0].items[0]
  assert.ok(dijkstra.content.includes("[ABC471 A問題](/atcoder/#ABC471-A)"))
  assert.deepEqual(dijkstra.mentions, [
    { id: "ABC471-A", label: "ABC471 A問題", href: "/atcoder/#ABC471-A" },
  ])

  // バックリンク: 問題側に解法タグ、解法側に問題タグ
  assert.deepEqual(problemA.referencedBy, [
    { id: "ダイクストラ法", label: "ダイクストラ法", href: "/atcoder/solution#ダイクストラ法" },
  ])
  assert.deepEqual(dijkstra.referencedBy, [
    { id: "ABC471-A", label: "ABC471 A問題", href: "/atcoder/#ABC471-A" },
  ])

  // 言及していない側は空のまま
  assert.deepEqual(result.contests[0].problems[1].referencedBy, [])
  assert.deepEqual(result.solutions[0].items[1].referencedBy, [])
  assert.deepEqual(result.solutions[0].items[1].mentions, [])
})

test("applyCrossReferences: 未解決の言及を unresolved で報告し、リンク化しない", () => {
  const contests = makeProblems()
  contests[0].problems[0].content = "[[存在しない]] を参照"
  const result = applyCrossReferences(contests, makeSolutions())
  assert.deepEqual(result.unresolved, ["存在しない"])
  assert.ok(result.contests[0].problems[0].content.includes("[[存在しない]]"))
})
