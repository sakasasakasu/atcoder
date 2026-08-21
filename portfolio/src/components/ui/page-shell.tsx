import type { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/ui/site-header"

/**
 * 各ページ共通のレイアウト骨格。サイドバー・ヘッダー・見出しブロックを組み立てる
 */
export function PageShell({
  sidebar,
  title,
  subtitle,
  children,
}: {
  sidebar: ReactNode
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <SidebarProvider>
      {sidebar}
      <main className="flex-1 space-y-6 p-6">
        <SiteHeader />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-sm">{subtitle}</p>
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}