import { SidebarProvider } from "@/components/ui/sidebar"
import { LibrarySidebar } from "@/components/ui/library-sidebar"
import { LibraryCard } from "@/components/ui/library-card"
import { SiteHeader } from "@/components/ui/site-header"
import { getLibrary } from "@/lib/data"

export default function LibraryPage() {
  const categories = getLibrary()

  return (
    <SidebarProvider>
      <LibrarySidebar categories={categories} />
      <main className="flex-1 space-y-6 p-6">
        <SiteHeader />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">ライブラリ</h1>
          <p className="text-muted-foreground text-sm">
            アルゴリズム・データ構造の実装をまとめているよ♪
          </p>
        </div>
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            ライブラリがまだありません。`library/` にカテゴリと `.md` を追加すると表示されます。
          </p>
        ) : (
          <div className="grid gap-6">
            {categories.map((category, index) => (
              <LibraryCard key={index} category={category} />
            ))}
          </div>
        )}
      </main>
    </SidebarProvider>
  )
}
