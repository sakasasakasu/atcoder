"use client"

import * as React from "react"
import { CheckIcon, CodeIcon, CopyIcon, Sparkles, Cpu, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Code } from "@/components/ui/code"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AiReview } from "@/types/contest"

function getRatingBadgeClass(rating?: string) {
  switch (rating?.toUpperCase()) {
    case "S":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
    case "A":
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    case "B":
      return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

/**
 * 「コードを見る」ボタンを押すとモーダルを開き、コードを表示する共通コンポーネント
 */
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
      // クリップボードが利用できない環境では何もしない
    }
  }

  const buttonLabel = label ? `コードを見る（${label}）` : "コードを見る"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <CodeIcon className="h-4 w-4" />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{label ? `コードを見る: ${label}` : "コードを見る"}</DialogTitle>
        </DialogHeader>

        {/* AI コードレビューパネル (シンプル化) */}
        {aiReview && (
          <div className="rounded-md border bg-muted/30 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold border-b pb-1.5">
              <div className="flex items-center gap-1.5 text-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>AI コードレビュー</span>
              </div>
              <div className="flex items-center gap-2">
                {aiReview.rating && (
                  <span
                    className={`inline-flex items-center gap-1 border px-1.5 py-0.5 rounded text-[11px] font-bold ${getRatingBadgeClass(
                      aiReview.rating
                    )}`}
                  >
                    <Award className="h-3 w-3" />
                    Rating: {aiReview.rating}
                  </span>
                )}
                {aiReview.complexity && (
                  <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-mono">
                    <Cpu className="h-3 w-3" />
                    {aiReview.complexity}
                  </span>
                )}
              </div>
            </div>

            {aiReview.summary && (
              <p className="text-muted-foreground leading-relaxed">
                {aiReview.summary}
              </p>
            )}
          </div>
        )}

        <div className="relative min-w-0">
          <div className="max-h-[70vh] overflow-auto rounded-sm">
            <Code code={code} language={language} />
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={handleCopy}
            aria-label="コードをコピー"
            className="bg-background absolute top-2 right-2 shadow-sm"
          >
            {copied ? <CheckIcon className="text-green-500 h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
