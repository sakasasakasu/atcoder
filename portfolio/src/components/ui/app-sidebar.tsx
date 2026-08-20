"use client"

import * as React from "react"
import { SidebarInput } from "@/components/ui/sidebar"
import { SidebarShell, SidebarLinkSection } from "@/components/ui/sidebar-shell"
import { Contest } from "@/types/contest"

export function AppSidebar({ contests }: { contests: Contest[] }) {
  const [query, setQuery] = React.useState("")
  const keyword = query.trim().toLowerCase()

  const filteredContests = contests
    .map((contest) => ({
      ...contest,
      problems: keyword
        ? contest.problems.filter((problem) => {
            const aiTags = problem.codes.flatMap((c) => c.aiReview?.tags ?? []).join(" ")
            const searchText = `${contest.abc} ${problem.id} ${problem.title} ${aiTags}`.toLowerCase()
            return searchText.includes(keyword)
          })
        : contest.problems,
    }))
    .filter((contest) => contest.problems.length > 0)

  return (
    <SidebarShell
      title="AtCoder精進"
      footerText="なんかカッコいい文章を書く。"
      toolbar={
        <div className="px-2 py-2">
          <SidebarInput
            type="search"
            placeholder="問題・AIタグを検索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      }
    >
      {filteredContests.length === 0 ? (
        <p className="text-muted-foreground px-4 py-2 text-sm">見つかりません。</p>
      ) : (
        filteredContests.map((contest) => (
          <SidebarLinkSection
            key={contest.abc}
            title={contest.abc}
            items={contest.problems.map((problem) => ({
              anchor: `${contest.abc}-${problem.id}`,
              label: problem.title,
            }))}
          />
        ))
      )}
    </SidebarShell>
  )
}