"use client"

import * as React from "react"
import {
  CheckIcon,
  Code as CodeIcon,
  CopyIcon,
  Sparkles,
  Award,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Code } from "@/components/ui/code"
import { Markdown } from "@/components/ui/markdown"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { AiReview } from "@/types/common"
import { formatComplexityToTex } from "@/lib/format"

function getRatingStyle(rating?: string) {
  switch (rating?.toUpperCase()) {
    case "S":
      return {
        label: "S Rank",
        badge: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30 shadow-amber-500/10",
      }
    case "A":
      return {
        label: "A Rank",
        badge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30 shadow-emerald-500/10",
      }
    case "B":
      return {
        label: "B Rank",
        badge: "bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-500/30 shadow-blue-500/10",
      }
    default:
      return {
        label: rating || "C Rank",
        badge: "bg-secondary text-secondary-foreground border-border",
      }
  }
}

function AiInspectorPanel({ aiReview }: { aiReview: AiReview }) {
  const [isOpen, setIsOpen] = React.useState(true)
  const ratingStyle = getRatingStyle(aiReview.rating)

  return (
    <div className="overflow-hidden rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-blue-500/5 shadow-xs backdrop-blur-sm transition-all">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 transition-colors hover:bg-indigo-500/10"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-foreground">
            AI Code Insights
          </span>
        </div>

        <div className="flex items-center gap-2">
          {aiReview.rating && (
            <span
              className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-bold shadow-2xs ${ratingStyle.badge}`}
            >
              <Award className="h-3 w-3" />
              {ratingStyle.label}
            </span>
          )}
          {aiReview.complexity && (
            <div className="inline-flex items-center rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[11px] font-medium text-foreground [&_p]:inline [&_p]:m-0">
              <Markdown>{formatComplexityToTex(aiReview.complexity)}</Markdown>
            </div>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6 p-0 text-muted-foreground">
            {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="border-t border-indigo-500/10 px-3.5 py-3 space-y-3 text-xs">
          {/* レビューサマリー解説 */}
          {aiReview.summary && (
            <p className="text-muted-foreground leading-relaxed">
              {aiReview.summary}
            </p>
          )}

          {/* AI タグ */}
          {aiReview.tags && aiReview.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
                Tags:
              </span>
              {aiReview.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* アルゴリズム・ロジック改善アドバイス */}
          {aiReview.improvement && (
            <div className="pt-2 border-t border-indigo-500/10">
              {aiReview.improvement.hasImprovement ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2.5">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-600 dark:text-amber-400 text-xs">
                    <Lightbulb className="h-4 w-4" />
                    <span>アルゴリズム改善アドバイス</span>
                  </div>

                  {/* ボトルネック */}
                  {aiReview.improvement.bottleneck && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <span className="text-red-400">⚠️</span> ボトルネック
                      </span>
                      <p className="text-xs text-foreground/90 leading-relaxed bg-background/60 p-2 rounded border border-border/40">
                        {aiReview.improvement.bottleneck}
                      </p>
                    </div>
                  )}

                  {/* 改善方針 */}
                  {aiReview.improvement.suggestion && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                        <span className="text-emerald-400">🚀</span> 改善方針
                      </span>
                      <p className="text-xs text-foreground/90 leading-relaxed bg-background/60 p-2 rounded border border-border/40">
                        {aiReview.improvement.suggestion}
                      </p>
                    </div>
                  )}

                  {/* Before / After スニペット */}
                  {(aiReview.improvement.beforeSnippet || aiReview.improvement.afterSnippet) && (
                    <div
                      className={cn(
                        "grid gap-2 pt-1",
                        aiReview.improvement.beforeSnippet && aiReview.improvement.afterSnippet
                          ? "grid-cols-1 md:grid-cols-2"
                          : "grid-cols-1"
                      )}
                    >
                      {aiReview.improvement.beforeSnippet && (
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-semibold text-red-500 dark:text-red-400 flex items-center gap-1">
                            <span>❌</span> 現状のロジック (Before)
                          </span>
                          <div className="rounded-md border border-red-500/30 bg-stone-950 overflow-x-auto">
                            <Code
                              code={aiReview.improvement.beforeSnippet}
                              language="cpp"
                              customStyle={{ padding: "0.5rem 0.65rem", fontSize: "0.75rem" }}
                              lineNumberStyle={{ minWidth: "1.25rem", paddingRight: "0.4rem", fontSize: "0.72rem" }}
                            />
                          </div>
                        </div>
                      )}
                      {aiReview.improvement.afterSnippet && (
                        <div className="space-y-1 min-w-0">
                          <span className="text-[10px] font-semibold text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                            <span>⭕️</span> 推奨ロジック (After)
                          </span>
                          <div className="rounded-md border border-emerald-500/30 bg-stone-950 overflow-x-auto">
                            <Code
                              code={aiReview.improvement.afterSnippet}
                              language="cpp"
                              customStyle={{ padding: "0.5rem 0.65rem", fontSize: "0.75rem" }}
                              lineNumberStyle={{ minWidth: "1.25rem", paddingRight: "0.4rem", fontSize: "0.72rem" }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>すでに計算量・ロジックともに最適なアルゴリズムで実装されています！</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function CodeDialog({
  code,
  language = "cpp",
  label,
  aiReview,
}: {
  code: string
  language?: string
  label?: string
  aiReview?: AiReview
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // クリップボード非対応時
    }
  }

  const buttonLabel = label ? `コードを見る（${label}）` : "コードを見る"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-center">
          <CodeIcon className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {label ? `コードを見る（${label}）` : "コードを見る"}
          </DialogTitle>
        </DialogHeader>

        {aiReview && <AiInspectorPanel aiReview={aiReview} />}

        {/* 解答コード表示エリア */}
        <div className="relative min-w-0">
          <div className="max-h-[65vh] overflow-auto rounded-lg border border-border/50">
            <Code code={code} language={language} />
          </div>
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={handleCopy}
            aria-label="コードをコピー"
            className="bg-background/90 hover:bg-background absolute top-2.5 right-2.5 shadow-sm backdrop-blur-md"
          >
            {copied ? <CheckIcon className="h-4 w-4 text-emerald-500" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
