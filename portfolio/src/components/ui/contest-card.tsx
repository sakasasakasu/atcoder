import { Accordion, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
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
              <div className="text-muted-foreground h-24 overflow-y-auto text-sm">
                {problem.content}
              </div>

              {/* C++コード（あれば） */}
              <Accordion type="single" collapsible>
                <AccordionItem value="cpp">
                  <AccordionTrigger>コードを見る</AccordionTrigger>
                  {problem.cpp && (
                    <div className="mt-auto">
                      <pre className="max-h-48 overflow-x-auto overflow-y-auto rounded bg-slate-950 p-3 text-xs text-slate-50">
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
  )
}
