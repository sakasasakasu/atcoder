import { SidebarProvider } from "@/components/ui/sidebar"
import { TipsSidebar } from "@/components/ui/tips-sidebar"
import { TipsGrid } from "@/components/ui/tips-grid"
import { SiteHeader } from "@/components/ui/site-header"
import { getTips } from "@/lib/data"

export default function TipsPage() {
  const categories = getTips()

  return (
    <SidebarProvider>
      <TipsSidebar categories={categories} />
      <main className="flex-1 space-y-6 p-6">
        <SiteHeader />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Tips</h1>
          <p className="text-muted-foreground text-sm">小ネタやコツをまとめているよ♪</p>
        </div>
        {categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            `tips/` にグループ（ディレクトリ）と `.md` を追加すると表示されます。
          </p>
        ) : (
          <TipsGrid categories={categories} />
        )}
      </main>
    </SidebarProvider>
  )
}
