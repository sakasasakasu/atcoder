import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { CodeDialog } from "@/components/ui/code-dialog"
import { MentionTags } from "@/components/ui/mention-tags"
import { Markdown } from "@/components/ui/markdown"
import { SolutionCategory } from "@/types/solution"

export function SolutionCard({ categories }: { categories: SolutionCategory[] }) {
  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.category} className="w-full overflow-hidden p-4">
          {/* グループ見出し */}
          <h2 className="mb-2 text-xl font-bold">{category.category}</h2>
          {/* 解法を横に並べるエリア */}
          <ScrollArea className="h-full w-full whitespace-nowrap">
            <div className="flex gap-4">
              {category.items.map((solution) => (
                <div
                  key={solution.id}
                  id={solution.id}
                  className="bg-card flex w-[350px] shrink-0 flex-col space-y-3 rounded-lg border p-4 whitespace-normal scroll-mt-28"
                >
                  {/* 解法タイトル */}
                  <h3 className="border-b pb-2 text-lg font-bold">{solution.title}</h3>

                  {/* 解説（markdown） */}
                  <div className="prose text-muted-foreground h-[200px] overflow-y-auto text-sm">
                    <Markdown>{solution.content}</Markdown>
                  </div>

                  {/* 実装コード（あれば） */}
                  {solution.codes.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {solution.codes.map((codeFile) => (
                        <CodeDialog
                          key={codeFile.name}
                          code={codeFile.code}
                          label={codeFile.name}
                        />
                      ))}
                    </div>
                  )}

                  {/* 問題から言及されたタグ */}
                  <MentionTags refs={solution.referencedBy} label="問題" />
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      ))}
    </div>
  )
}

