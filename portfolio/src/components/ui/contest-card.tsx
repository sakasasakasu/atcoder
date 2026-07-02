import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { Contest } from "@/types/contest"

import ReactMarkdown from "react-markdown"

export function ContestCard({ contest }: { contest: Contest }) {
  return (
    <div className="w-full overflow-hidden p-4">
      <h2 className="mb-2 text-xl font-bold">{contest.abc}</h2>
      <p className="text-muted-foreground mb-4 text-sm">{contest.summary}</p>
      {/* 問題 A, B, C... を横に並べるエリア */}
      <ScrollArea className="h-full w-full whitespace-nowrap">
        <div className="flex gap-4">
          {contest.problems.map((problem) => (
            <div
              key={problem.id}
              id={`${contest.abc}-${problem.id}`}
              className="bg-card flex w-[350px] shrink-0 flex-col space-y-3 rounded-lg border p-4 whitespace-normal"
            >
              {/* 問題タイトル */}
              <h3 className="border-b pb-2 text-lg font-bold">{problem.title}</h3>

              {/* レビュー */}
              <div className="prose text-muted-foreground h-[200px] overflow-y-auto text-sm">
                <ReactMarkdown>{problem.content}</ReactMarkdown>
              </div>

              {/* C++コード（あれば） */}
              <Accordion type="single" collapsible>
                <AccordionItem value="cpp">
                  <AccordionTrigger>コードを見る</AccordionTrigger>
                  <AccordionContent>
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
                  </AccordionContent>
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
