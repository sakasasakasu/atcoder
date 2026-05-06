import fs from "fs"
import path from "path"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

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
        <h2 className="text-xl font-bold mb-2">{contest.abc}</h2>
        <p className="text-sm text-muted-foreground mb-4">{contest.summary}</p>
        {/* 問題 A, B, C... を横に並べるエリア */}
        <ScrollArea className="w-full whitespace-nowrap p-4">
          <div className="flex gap-4">
            {contest.problems.map((problem) => (
              <div 
                key={problem.id} 
                className="w-[350px] shrink-0 flex flex-col space-y-3 rounded-lg border bg-card p-4 whitespace-normal"
              >
                {/* 問題タイトル */}
                <h3 className="font-bold text-lg border-b pb-2">
                  {problem.title}
                </h3>

                {/* 問題内容（スクロール可能） */}
                <div className="text-sm text-muted-foreground h-24 overflow-y-auto">
                  {problem.content}
                </div>

                {/* C++コード（あれば） */}
                <Accordion type="single" collapsible>
                  <AccordionItem value="cpp">
                    <AccordionTrigger>コードを見る</AccordionTrigger>
                {problem.cpp && (
                  <div className="mt-auto">
                    <pre className="p-3 rounded bg-slate-950 text-slate-50 text-xs overflow-x-auto max-h-48 overflow-y-auto">
                      <code className="font-mono">{problem.cpp}</code>
                    </pre>
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
  );
}