"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { Code } from "@/components/ui/code"

/**
 * コードをアコーディオン内に表示し、コピーボタンを提供する共通コンポーネント
 */
export function CodeAccordion({
  code,
  language = "cpp",
}: {
  code: string
  language?: string
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

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="code">
        <AccordionTrigger>コードを見る</AccordionTrigger>
        <AccordionContent>
          <div className="relative">
            <Code code={code} language={language} />
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
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
