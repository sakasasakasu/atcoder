import { SidebarProvider } from "@/components/ui/sidebar"
import { SolutionSidebar } from "@/components/ui/solution-sidebar"
import { SolutionCard } from "@/components/ui/solution-card"
import { SiteHeader } from "@/components/ui/site-header"
import { getSolutions } from "@/lib/data"

export default function SolutionPage() {
  const solutions = getSolutions()

  return (
    <SidebarProvider>
      <SolutionSidebar solutions={solutions} />
      <main className="flex-1 space-y-6 p-6">
        <SiteHeader />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">解法</h1>
          <p className="text-muted-foreground text-sm">
            問題の解き方や典型パターンのメモをまとめているよ♪
          </p>
        </div>
        {solutions.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            `solutions/` に `.md` を追加すると表示されます。
          </p>
        ) : (
          <SolutionCard solutions={solutions} />
        )}
      </main>
    </SidebarProvider>
  )
}
