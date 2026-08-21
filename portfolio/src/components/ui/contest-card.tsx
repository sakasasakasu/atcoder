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
import { getDiffCircleStyle } from "@/lib/difficulty"
import { formatComplexityToTex } from "@/lib/format"

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
              const diffCircle = getDiffCircleStyle(problem.difficulty, problem.difficultyColor)

              return (
                <div
                  key={problem.id}
                  id={`${contest.abc}-${problem.id}`}
                  className="bg-card flex w-[350px] shrink-0 flex-col space-y-3 rounded-xl border border-border/60 p-4 whitespace-normal scroll-mt-28 transition-all"
                >
                  {/* 問題タイトル + 難易度サークル (左側・水深表現) + 外部リンク */}
                  <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span
                            className="size-5 shrink-0 rounded-full border-2 transition-transform cursor-help"
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

                  {/* C++コード枠：計算量は小ぶりで上品な KaTeX 数式表示 (text-[11px]) + Separator 区切り */}
                  {problem.codes.length > 0 && (
                    <div className="flex flex-col gap-2 pt-1 border-t border-border/40">
                      {problem.codes.map((codeFile, idx) => {
                        const review = codeFile.aiReview
                        return (
                          <React.Fragment key={codeFile.name}>
                            {idx > 0 && <Separator className="my-1 bg-border/40" />}
                            <div className="flex flex-col gap-1.5 py-0.5">
                              {/* 計算量 (小ぶりな 11px KaTeX レンダリング) + #タグ 1 #タグ 2 ... の行 */}
                              {review && (review.complexity || (review.tags && review.tags.length > 0)) && (
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                  {review.complexity && (
                                    <div className="text-[11px] text-foreground/90 font-medium [&_p]:inline [&_p]:m-0">
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
