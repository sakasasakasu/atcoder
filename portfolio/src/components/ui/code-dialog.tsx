"use client"

import * as React from "react"
import { CheckIcon, CodeIcon, CopyIcon, Sparkles, Cpu, Award, Tag } from "lucide-react"
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

/**
 * 評価ランクに応じたバッジカラーを返します
 */
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
 * 「コードを見る」ボタンを押すとモーダルを開き、コード、コピーボタン、および AI コードレビューを表示する共通コンポーネント
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
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{label ? `コードを見る: ${label}` : "コードを見る"}</span>
          </DialogTitle>
        </DialogHeader>

        {/* AI コードレビューパネル（存在する場合） */}
        {aiReview && (
          <div className="rounded-lg border bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>AI コードレビュー (Gemini)</span>
              </div>
              <div className="flex items-center gap-2">
                {aiReview.rating && (
                  <span
                    className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full text-xs font-bold ${getRatingBadgeClass(
                      aiReview.rating
                    )}`}
                  >
                    <Award className="h-3 w-3" />
                    Rating: {aiReview.rating}
                  </span>
                )}
                {aiReview.complexity && (
                  <span className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs font-mono font-medium">
                    <Cpu className="h-3 w-3" />
                    {aiReview.complexity}
                  </span>
                )}
              </div>
            </div>

            {/* レビュー本文 */}
            {aiReview.summary && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aiReview.summary}
              </p>
            )}

            {/* AI タグ */}
            {aiReview.tags && aiReview.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {aiReview.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-background px-2 py-0.5 text-xs text-primary"
                  >
                    <Tag className="h-2.5 w-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ソースコード表示エリア */}
        <div className="relative min-w-0">
          <div className="max-h-[60vh] overflow-auto rounded-sm">
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
