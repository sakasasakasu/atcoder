import { Accordion, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"

import ReactMarkdown from "react-markdown"

interface Problem {
  id: string
  title: string
  content: string
  cpp?: string
}

interface Contest {
  abc: string
  summary: string
  problems: Problem[]
}

export function ContestCard({ contest }: { contest: Contest }) {
  return (
    <div className="w-full overflow-hidden">
      <h2 className="mb-2 text-xl font-bold">{contest.abc}</h2>
      <p className="text-muted-foreground mb-4 text-sm">{contest.summary}</p>
      {/* 問題 A, B, C... を横に並べるエリア */}
      <ScrollArea className="w-full p-4 whitespace-nowrap">
        <div className="flex gap-4">
          {contest.problems.map((problem) => (
            <div
              key={problem.id}
              id={`${contest.abc}-${problem.id}`}
              className="bg-card flex w-[350px] shrink-0 flex-col space-y-3 rounded-lg border p-4 whitespace-normal"
            >
              {/* 問題タイトル */}
              <h3 className="border-b pb-2 text-lg font-bold">{problem.title}</h3>

              {/* 問題内容（スクロール可能） */}
              <div className="prose text-muted-foreground h-24 overflow-y-auto text-sm">
                <ReactMarkdown>{problem.content}</ReactMarkdown>
              </div>

              {/* C++コード（あれば） */}
              <Accordion type="single" collapsible>
                <AccordionItem value="cpp">
                  <AccordionTrigger>コードを見る</AccordionTrigger>
                  {problem.cpp && (
                    <div className="mt-auto">
                      <div className="overflow-hidden rounded-md text-xs">
                        <SyntaxHighlighter
                          language="cpp"
                          style={oneDark}
                          showLineNumbers={true}
                          customStyle={{
                            margin: 0,
                            padding: "12px",
                            maxHeight: "12rem",
                          }}
                          codeTagProps={{
                            style: {
                              fontFamily: "var(--font-mono)",
                            },
                          }}
                        >
                          {problem.cpp}
                        </SyntaxHighlighter>
                      </div>
                    </div>
                  )}
                </AccordionItem>
              </Accordion>
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
