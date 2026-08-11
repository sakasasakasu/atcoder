"use client"

import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ReactNode } from "react"

/**
 * サイドバーの共通骨格。ヘッダー・ツールバー・スクロール領域・フッターを組み立てる
 */
export function SidebarShell({
  title,
  footerText,
  toolbar,
  children,
}: {
  title: string
  footerText: string
  toolbar?: ReactNode
  children: ReactNode
}) {
  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="px-4 py-2 text-lg font-bold">{title}</h1>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup />
        {toolbar}
        <ScrollArea className="min-h-0 flex-1">{children}</ScrollArea>
        <SidebarGroup />
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <p className="text-muted-foreground px-4 py-2 text-xs">{footerText}</p>
      </SidebarFooter>
    </Sidebar>
  )
}

/**
 * グループ見出しとアンカーリンク一覧を表示する
 */
export function SidebarLinkSection({
  title,
  items,
}: {
  title: string
  items: { anchor: string; label: string }[]
}) {
  return (
    <div className="px-4 py-2">
      <h2 className="text-md py-2 font-semibold">{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.anchor} className="py-2 text-sm">
            <a className="text-blue-500 hover:underline" href={`#${item.anchor}`}>
              {item.label}
            </a>
            <Separator className="mt-2" />
          </li>
        ))}
      </ul>
    </div>
  )
}
