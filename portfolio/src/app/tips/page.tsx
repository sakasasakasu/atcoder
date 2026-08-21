import { TipsSidebar } from "@/components/ui/tips-sidebar"
import { TipsGrid } from "@/components/ui/tips-grid"
import { PageShell } from "@/components/ui/page-shell"
import { getTips } from "@/lib/data"

export default function TipsPage() {
  const categories = getTips()

  return (
    <PageShell
      sidebar={<TipsSidebar categories={categories} />}
      title="Tips"
      subtitle="小ネタやコツをまとめているよ♪"
    >
      {categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          `tips/` にグループ（ディレクトリ）と `.md` を追加すると表示されます。
        </p>
      ) : (
        <TipsGrid categories={categories} />
      )}
    </PageShell>
  )
}
