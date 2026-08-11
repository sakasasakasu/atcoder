import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { LibraryCategory } from "@/types/library"

import ReactMarkdown from "react-markdown"

export function LibraryCard({ category }: { category: LibraryCategory }) {
  return (
    <div className="w-full overflow-hidden p-4">
      <h2 className="mb-2 text-xl font-bold">{category.category}</h2>
      {/* ライブラリ項目を横に並べるエリア */}
      <ScrollArea className="h-full w-full whitespace-nowrap">
        <div className="flex gap-4">
          {category.items.map((item) => (
            <div
              key={item.id}
              id={`${category.category}-${item.id}`}
              className="bg-card flex w-[350px] shrink-0 flex-col space-y-3 rounded-lg border p-4 whitespace-normal scroll-mt-28"
            >
              {/* 項目タイトル */}
              <h3 className="border-b pb-2 text-lg font-bold">{item.title}</h3>

              {/* 説明（markdown） */}
              <div className="prose text-muted-foreground h-[200px] overflow-y-auto text-sm">
                <ReactMarkdown>{item.content}</ReactMarkdown>
              </div>

              {/* 実装コード（あれば） */}
              {item.cpp && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="cpp">
                    <AccordionTrigger>コードを見る</AccordionTrigger>
                    <AccordionContent>
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
                            {item.cpp}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}
