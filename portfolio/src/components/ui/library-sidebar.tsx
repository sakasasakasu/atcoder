"use client"

import * as React from "react"
import { SidebarInput } from "@/components/ui/sidebar"
import { SidebarShell, SidebarLinkSection } from "@/components/ui/sidebar-shell"
import { LibraryCategory } from "@/types/library"

export function LibrarySidebar({ categories }: { categories: LibraryCategory[] }) {
  const [query, setQuery] = React.useState("")
  const keyword = query.trim().toLowerCase()

  const filteredCategories = categories
    .map((category) => ({
      ...category,
      items: keyword
        ? category.items.filter((item) =>
            `${category.category} ${item.id} ${item.title}`.toLowerCase().includes(keyword),
          )
        : category.items,
    }))
    .filter((category) => category.items.length > 0)

  return (
    <SidebarShell
      title="ライブラリ"
      footerText="アルゴリズム・データ構造の実装メモ。"
      toolbar={
        <div className="px-2 py-2">
          <SidebarInput
            type="search"
            placeholder="ライブラリを検索"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      }
    >
      {filteredCategories.length === 0 ? (
        <p className="text-muted-foreground px-4 py-2 text-sm">見つかりません。</p>
      ) : (
        filteredCategories.map((category) => (
          <SidebarLinkSection
            key={category.category}
            title={category.category}
            items={category.items.map((item) => ({
              anchor: `${category.category}-${item.id}`,
              label: item.title,
            }))}
          />
        ))
      )}
    </SidebarShell>
  )
}