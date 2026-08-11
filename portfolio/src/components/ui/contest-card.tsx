import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CodeAccordion } from "@/components/ui/code-accordion"
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
              className="bg-card flex w-[350px] shrink-0 flex-col space-y-3 rounded-lg border p-4 whitespace-normal scroll-mt-28"
            >
              {/* 問題タイトル */}
              <h3 className="border-b pb-2 text-lg font-bold">{problem.title}</h3>

              {/* レビュー */}
              <div className="prose text-muted-foreground h-[200px] overflow-y-auto text-sm">
                <ReactMarkdown>{problem.content}</ReactMarkdown>
              </div>

              {/* C++コード（あれば） */}
              {problem.cpp && <CodeAccordion code={problem.cpp} />}
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}