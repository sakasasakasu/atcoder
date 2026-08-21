import { AppSidebar } from "@/components/ui/app-sidebar"
import { ContestCard } from "@/components/ui/contest-card"
import { PageShell } from "@/components/ui/page-shell"
import { getContests } from "@/lib/data"

export default function Home() {
  const contests = getContests()

  return (
    <PageShell
      sidebar={<AppSidebar contests={contests} />}
      title="問題一覧"
      subtitle="解いた問題を見る事が出来る♪"
    >
      <div className="grid gap-6">
        {contests.map((contest) => (
          <ContestCard key={contest.abc} contest={contest} />
        ))}
      </div>
    </PageShell>
  )
}
