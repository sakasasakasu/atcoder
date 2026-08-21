import { LibrarySidebar } from "@/components/ui/library-sidebar"
import { LibraryCard } from "@/components/ui/library-card"
import { PageShell } from "@/components/ui/page-shell"
import { getLibrary } from "@/lib/data"

export default function LibraryPage() {
  const categories = getLibrary()

  return (
    <PageShell
      sidebar={<LibrarySidebar categories={categories} />}
      title="ライブラリ"
      subtitle="アルゴリズム・データ構造の実装をまとめているよ♪"
    >
      {categories.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          ライブラリがまだありません。`library/` にカテゴリと `.md` を追加すると表示されます。
        </p>
      ) : (
        <div className="grid gap-6">
          {categories.map((category) => (
            <LibraryCard key={category.category} category={category} />
          ))}
        </div>
      )}
    </PageShell>
  )
}
