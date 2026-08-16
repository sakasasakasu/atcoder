"use client"

import * as React from "react"
import { SidebarInput } from "@/components/ui/sidebar"
import { SidebarShell, SidebarLinkSection } from "@/components/ui/sidebar-shell"
import { Solution } from "@/types/solution"

export function SolutionSidebar({ solutions }: { solutions: Solution[] }) {
  const [query, setQuery] = React.useState("")
  const keyword = query.trim().toLowerCase()

  const filteredSolutions = keyword
    ? solutions.filter((solution) =>
        `${solution.id} ${solution.title}`.toLowerCase().includes(keyword),
      )
    : solutions

  return (
    <SidebarShell
      title="解法"
      footerText="問題の解法メモ。"
      toolbar={
        <div className="px-2 py-2">
          <SidebarInput
            type="search"
            placeholder="解法を検索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      }
    >
      {filteredSolutions.length === 0 ? (
        <p className="text-muted-foreground px-4 py-2 text-sm">見つかりません。</p>
      ) : (
        <SidebarLinkSection
          title="解法"
          items={filteredSolutions.map((solution) => ({
            anchor: solution.id,
            label: solution.title,
          }))}
        />
      )}
    </SidebarShell>
  )
}
