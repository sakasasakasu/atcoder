"use client"

import * as React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

import { cn } from "@/lib/utils"

interface CodeProps extends React.ComponentPropsWithoutRef<"div"> {
  code: string
  language?: string
}

function Code({ code, language = "text", className, ...props }: CodeProps) {
  return (
    <div className={cn("rounded-sm bg-stone-950", className)} {...props}>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers
        wrapLongLines
        customStyle={{ margin: 0, padding: "1rem", background: "transparent" }}
        lineNumberStyle={{fontSize: "0.78rem", minWidth: "2rem", paddingRight: "0.75rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

export { Code }
