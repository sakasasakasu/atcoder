import { SolutionSidebar } from "@/components/ui/solution-sidebar"
import { SolutionCard } from "@/components/ui/solution-card"
import { PageShell } from "@/components/ui/page-shell"
import { getSolutions } from "@/lib/data"

export default function SolutionPage() {
  const categories = getSolutions()

  return (
    <PageShell
      sidebar={<SolutionSidebar categories={categories} />}
      title="解法"
      subtitle="問題の解き方や典型パターンのメモをまとめているよ♪"
    >
      {categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          `solutions/` にグループ（ディレクトリ）と `.md` を追加すると表示されます。
        </p>
      ) : (
        <SolutionCard categories={categories} />
      )}
    </PageShell>
  )
}
