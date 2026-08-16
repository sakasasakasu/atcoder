"use client"

import * as React from "react"
import { CheckIcon, CodeIcon, CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Code } from "@/components/ui/code"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

/**
 * 「コードを見る」ボタンを押すとモーダルを開き、コードとコピーボタンを表示する共通コンポーネント
 */
export function CodeDialog({
  code,
  language = "cpp",
  label,
}: {
  code: string
  language?: string
  label?: string
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
          <CodeIcon />
          {buttonLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{label ? `コードを見る: ${label}` : "コードを見る"}</DialogTitle>
        </DialogHeader>
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
            {copied ? <CheckIcon className="text-green-500" /> : <CopyIcon />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
