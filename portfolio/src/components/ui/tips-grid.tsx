"use client"

import { Markdown } from "@/components/ui/markdown"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tip, TipCategory } from "@/types/tip"

/**
 * Markdown を平文に簡易変換してプレビュー用テキストにする
 */
function toPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ") // コードブロックを除去
    .replace(/`([^`]*)`/g, "$1") // インラインコード
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // リンク → ラベル
    .replace(/\$\$?([^$]*)\$\$?/g, "$1") // LaTeX → 中身
    .replace(/[#>*_~|]/g, " ") // 見出し・強調記号を除去
    .replace(/\s+/g, " ")
    .trim()
}

/**
 * 1 件の Tips タイル。クリックでモーダルに全文（LaTeX 込み markdown）を表示する
 */
function TipTile({ tip }: { tip: Tip }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          id={tip.id}
          className="bg-card hover:bg-muted flex flex-col gap-1 rounded-lg border p-3 text-left transition-colors scroll-mt-28"
        >
          <span className="text-sm font-semibold">{tip.title}</span>
          <span className="text-muted-foreground line-clamp-2 text-xs">
            {toPlainText(tip.content)}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tip.title}</DialogTitle>
        </DialogHeader>
        <div className="prose text-muted-foreground max-h-[70vh] overflow-y-auto text-sm">
          <Markdown>{tip.content}</Markdown>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * グループごとに Tips を小さなタイルのグリッドで一覧表示する
 */
export function TipsGrid({ categories }: { categories: TipCategory[] }) {
  return (
    <div className="space-y-6 p-4">
      {categories.map((category) => (
        <div key={category.category}>
          <h2 className="mb-3 text-xl font-bold">{category.category}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((tip) => (
              <TipTile key={tip.id} tip={tip} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
