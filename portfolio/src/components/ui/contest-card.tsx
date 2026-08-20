import { ExternalLink, BarChart2, Cpu, Tag } from "lucide-react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CodeDialog } from "@/components/ui/code-dialog"
import { MentionTags } from "@/components/ui/mention-tags"
import { Markdown } from "@/components/ui/markdown"
import { Contest } from "@/types/contest"

export function ContestCard({ contest }: { contest: Contest }) {
  return (
    <div className="w-full overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{contest.abc}</h2>
          <p className="text-muted-foreground text-sm">{contest.summary}</p>
        </div>
      </div>

      {/* 問題 A, B, C... を横に並べるエリア */}
      <ScrollArea className="h-full w-full whitespace-nowrap">
        <div className="flex gap-4 pb-4">
          {contest.problems.map((problem) => {
            const diffColor = problem.difficultyColor
            // 負の difficulty は「簡単すぎてレート未確定」の目安のため ~ 付きの概算表示にする
            const diffLabel =
              problem.difficulty !== undefined
                ? `Diff: ${problem.difficulty < 0 ? `~${Math.abs(Math.round(problem.difficulty))}` : Math.round(problem.difficulty)}`
                : "Diff: Unrated"

            return (
              <div
                key={problem.id}
                id={`${contest.abc}-${problem.id}`}
                className="bg-card flex w-[360px] shrink-0 flex-col space-y-3 rounded-lg border p-4 whitespace-normal scroll-mt-28 shadow-sm transition-all hover:shadow-md"
              >
                {/* 問題タイトル + Diff バッジ + 外部リンク */}
                <div className="flex items-start justify-between border-b pb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold">{problem.title}</h3>
                      {diffColor && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${diffColor.colorClass}`}
                        >
                          {diffLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 外部リンクボタン */}
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    {problem.url && (
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground transition-colors p-1"
                        title="AtCoder公式問題ページを開く"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {problem.problemsUrl && (
                      <a
                        href={problem.problemsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground transition-colors p-1"
                        title="AtCoder Problems で見る"
                      >
                        <BarChart2 className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* AI メタデータ（計算量・AIタグ） */}
                {problem.aiReview && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    {problem.aiReview.complexity && (
                      <span className="inline-flex items-center gap-1 rounded bg-secondary/80 px-2 py-0.5 font-mono text-secondary-foreground">
                        <Cpu className="h-3 w-3" />
                        {problem.aiReview.complexity}
                      </span>
                    )}
                    {problem.aiReview.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded border border-primary/20 bg-primary/5 px-2 py-0.5 text-primary"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 問題・解説メモ */}
                <div className="prose text-muted-foreground min-h-[160px] max-h-[220px] overflow-y-auto text-sm">
                  <Markdown>{problem.content}</Markdown>
                </div>

                {/* C++コード（あれば） */}
                {problem.codes.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
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