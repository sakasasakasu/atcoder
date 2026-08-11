import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { ContestCard } from "@/components/ui/contest-card"
import { SiteHeader } from "@/components/ui/site-header"
import { getContests } from "@/lib/data"

export default function Home() {
  const contests = getContests()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 space-y-6 p-6">
        <SiteHeader />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">問題一覧</h1>
          <p className="text-muted-foreground text-sm">解いた問題を見る事が出来る♪</p>
        </div>
        <div className="grid gap-6">
          {contests.map((contest, index) => (
            <ContestCard key={index} contest={contest} />
          ))}
        </div>
      </main>
    </SidebarProvider>
  )
}
