import { ExternalLink, Cpu } from "lucide-react"
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
        <div className="flex gap-4 pb-2">
          {contest.problems.map((problem) => {
            const diffColor = problem.difficultyColor
            const diffText = problem.difficulty !== undefined ? `Diff ${problem.difficulty}` : "Diff -"

            return (
              <div
                key={problem.id}
                id={`${contest.abc}-${problem.id}`}
                className="bg-card flex w-[350px] shrink-0 flex-col space-y-3 rounded-lg border p-4 whitespace-normal scroll-mt-28"
              >
                {/* 問題タイトル + Diff バッジ + 外部リンク */}
                <div className="flex items-center justify-between border-b pb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold">{problem.title}</h3>
                    {diffColor && (
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${diffColor.colorClass}`}
                      >
                        {diffText}
                      </span>
                    )}
                  </div>

                  {problem.url && (
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="AtCoder公式問題ページを開く"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* 感想・メモ (元のサイズ固定) */}
                <div className="prose text-muted-foreground h-[200px] overflow-y-auto text-sm">
                  <Markdown>{problem.content}</Markdown>
                </div>

                {/* AI メタデータ (計算量・タグ) */}
                {problem.aiReview && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {problem.aiReview.complexity && (
                      <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-secondary-foreground">
                        <Cpu className="h-3 w-3" />
                        {problem.aiReview.complexity}
                      </span>
                    )}
                    {problem.aiReview.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-muted-foreground"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* C++コード（あれば） */}
                {problem.codes.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {problem.codes.map((codeFile) => (
                      <CodeDialog
                        key={codeFile.name}
                        code={codeFile.code}
                        label={codeFile.name}
                        aiReview={problem.aiReview}
                      />
                    ))}
                  </div>
                )}

                {/* 解法から言及されたタグ */}
                <MentionTags refs={problem.referencedBy} label="解法" />
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}