import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CodeDialog } from "@/components/ui/code-dialog"
import { MentionTags } from "@/components/ui/mention-tags"
import { Markdown } from "@/components/ui/markdown"
import { Contest } from "@/types/contest"

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
                <Markdown>{problem.content}</Markdown>
              </div>

              {/* C++コード（あれば） */}
              {problem.codes.length > 0 && (
                <div className="flex flex-col gap-2">
                  {problem.codes.map((codeFile) => (
                    <CodeDialog key={codeFile.name} code={codeFile.code} label={codeFile.name} />
                  ))}
                </div>
              )}

              {/* 解法から言及されたタグ */}
              <MentionTags refs={problem.referencedBy} label="解法" />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}