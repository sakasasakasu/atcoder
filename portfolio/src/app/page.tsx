import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { ContestCard } from "@/components/ui/contest-card"
import { getContests } from "@/lib/data"

export default function Home() {
  const contests = getContests()

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 space-y-6 p-6">
        <h1 className="mb-4 text-2xl font-bold">コンテストの一覧</h1>
        <div className="grid gap-6">
          {/* 全てのコンテストをリスト表示 */}
          {contests.map((contest, index) => (
            <ContestCard key={index} contest={contest} />
          ))}
        </div>
      </main>
    </SidebarProvider>
  )
}
