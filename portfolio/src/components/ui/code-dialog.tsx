"use client"

import * as React from "react"
import { Code as CodeIcon, Sparkles, Award, ChevronDown, ChevronUp } from "lucide-react"
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
import { AiReview } from "@/types/common"
import { formatComplexityToTex } from "@/components/ui/contest-card"

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
        <div className="border-t border-indigo-500/10 px-3.5 py-3 space-y-2.5 text-xs">
          {aiReview.summary && (
            <p className="text-muted-foreground leading-relaxed">
              {aiReview.summary}
            </p>
          )}

          {aiReview.tags && aiReview.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
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
        </div>
      )}
    </div>
  )
}

export function CodeDialog({
  code,
  label,
  aiReview,
}: {
  code: string
  label: string
  aiReview?: AiReview
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full flex items-center justify-center gap-2 text-xs">
          <CodeIcon className="h-4 w-4" />
          <span>コードを見る ({label})</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <CodeIcon className="h-5 w-5 text-muted-foreground" />
            <span>解答コード: {label}.cpp</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
          {/* AI レビューパネル (レビュー情報が存在する場合に表示) */}
          {aiReview && <AiInspectorPanel aiReview={aiReview} />}

          {/* C++ ソースコード */}
          <div className="rounded-lg border overflow-hidden">
            <Code code={code} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
