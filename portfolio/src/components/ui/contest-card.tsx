"use client"

import * as React from "react"
import { ExternalLink } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CodeDialog } from "@/components/ui/code-dialog"
import { MentionTags } from "@/components/ui/mention-tags"
import { Markdown } from "@/components/ui/markdown"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Contest } from "@/types/contest"

/**
 * Diff の値から「下から上に水のように色が満ちていく」円のスタイルを生成します
 */
function getDiffCircleStyle(difficulty?: number) {
  if (difficulty === undefined || difficulty === null) {
    return {
      style: {
        borderColor: "#888888",
        background: "transparent",
      },
      label: "Unrated",
    }
  }

  const val = Math.max(0, Math.round(difficulty))
  const rates = [
    { min: 0, max: 400, color: "#808080" },      // 灰
    { min: 400, max: 800, color: "#804000" },    // 茶
    { min: 800, max: 1200, color: "#008000" },   // 緑
    { min: 1200, max: 1600, color: "#00C0C0" },  // 水
    { min: 1600, max: 2000, color: "#0000FF" },  // 青
    { min: 2000, max: 2400, color: "#C0C000" },  // 黄
    { min: 2400, max: 2800, color: "#FF8000" },  // 橙
  ]

  let color = "#FF0000" // 赤 (2800+)
  let pct = 100

  if (val < 2800) {
    for (const r of rates) {
      if (val >= r.min && val < r.max) {
        color = r.color
        pct = Math.max(0, Math.min(100, Math.round(((val - r.min) / (r.max - r.min)) * 100)))
        break
      }
    }
  }

  return {
    style: {
      borderColor: color,
      background: `linear-gradient(to top, ${color} 0%, ${color} ${pct}%, transparent ${pct}%, transparent 100%)`,
    },
    label: `Difficulty: ${val}`,
  }
}

/**
 * 計算量文字列（例: "O(N log N)"）を KaTeX 数式（例: "$O(N \\log N)$"）に整形
 */
export function formatComplexityToTex(complexity?: string) {
  if (!complexity) return ""
  let text = complexity.trim()
  if (text.startsWith("$") && text.endsWith("$")) {
    return text
  }
  // log を \log に置換
  text = text.replace(/(?<!\\)log/gi, "\\log ")
  return `$${text}$`
}

export function ContestCard({ contest }: { contest: Contest }) {
  return (
    <TooltipProvider>
      <div className="w-full overflow-hidden p-4">
        <h2 className="mb-2 text-xl font-bold">{contest.abc}</h2>
        <p className="text-muted-foreground mb-4 text-sm">{contest.summary}</p>

        {/* 問題 A, B, C... を横に並べるエリア */}
        <ScrollArea className="h-full w-full whitespace-nowrap">
          <div className="flex gap-4 pb-2">
            {contest.problems.map((problem) => {
              const diffCircle = getDiffCircleStyle(problem.difficulty)

              return (
                <div
                  key={problem.id}
                  id={`${contest.abc}-${problem.id}`}
                  className="bg-card flex w-[350px] shrink-0 flex-col space-y-3 rounded-xl border border-border/60 p-4 whitespace-normal scroll-mt-28 shadow-2xs transition-all hover:border-border hover:shadow-xs"
                >
                  {/* 問題タイトル + 難易度サークル (左側・水深表現) + 外部リンク */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="size-5 shrink-0 rounded-full border-2 shadow-2xs transition-transform hover:scale-110 cursor-help"
                            style={diffCircle.style}
                            aria-label={diffCircle.label}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="font-semibold text-xs">{diffCircle.label}</p>
                        </TooltipContent>
                      </Tooltip>

                      <h3 className="text-lg font-bold tracking-tight">{problem.title}</h3>
                    </div>

                    {problem.url && (
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors p-1"
                        title="AtCoder公式問題ページを開く"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* 感想・メモ */}
                  <div className="prose text-muted-foreground h-[200px] overflow-y-auto text-sm leading-relaxed">
                    <Markdown>{problem.content}</Markdown>
                  </div>

                  {/* C++コード枠：計算量は KaTeX 数式表示 + Separator 区切り */}
                  {problem.codes.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1 border-t border-border/40">
                      {problem.codes.map((codeFile, idx) => {
                        const review = codeFile.aiReview
                        return (
                          <React.Fragment key={codeFile.name}>
                            {idx > 0 && <Separator className="my-1 bg-border/40" />}
                            <div className="flex flex-col gap-1.5 py-0.5">
                              {/* 計算量 (KaTeX 数式レンダリング) + #タグ 1 #タグ 2 ... の行 */}
                              {review && (review.complexity || (review.tags && review.tags.length > 0)) && (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {review.complexity && (
                                    <div className="text-sm text-foreground/90 font-medium [&_p]:inline [&_p]:m-0">
                                      <Markdown>{formatComplexityToTex(review.complexity)}</Markdown>
                                    </div>
                                  )}
                                  {review.tags?.map((tag) => (
                                    <span
                                      key={tag}
                                      className="inline-flex items-center rounded border border-border/40 bg-background/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* ＜＞ コードを見る（A） ボタン */}
                              <CodeDialog
                                code={codeFile.code}
                                label={codeFile.name}
                                aiReview={review}
                              />
                            </div>
                          </React.Fragment>
                        )
                      })}
                    </div>
                  )}

                  {/* 解法から言及されたタグ */}
                  <MentionTags refs={problem.referencedBy} label="解法" />
                </div>
              )
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}