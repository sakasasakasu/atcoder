"use client"

import * as React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

import { cn } from "@/lib/utils"

interface CodeProps extends React.ComponentPropsWithoutRef<"div"> {
  code: string
  language?: string
  showLineNumbers?: boolean
  customStyle?: React.CSSProperties
  lineNumberStyle?: React.CSSProperties
}

function Code({
  code,
  language = "text",
  showLineNumbers = true,
  customStyle,
  lineNumberStyle,
  className,
  ...props
}: CodeProps) {
  return (
    <div className={cn("rounded-sm bg-stone-950 w-max min-w-full", className)} {...props}>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={showLineNumbers}
        customStyle={{
          margin: 0,
          padding: "1rem",
          background: "transparent",
          ...customStyle,
        }}
        lineNumberStyle={{
          fontSize: "0.78rem",
          minWidth: "2rem",
          paddingRight: "0.75rem",
          ...lineNumberStyle,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export { Code }
