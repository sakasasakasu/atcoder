import Link from "next/link"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  return (
    <header className="border-border bg-background sticky top-0 z-10 border-b">
      <nav className="flex items-center gap-4 px-1 py-3 text-sm">
        {/* モバイルではサイドバーを開くためのトグルを表示する */}
        <SidebarTrigger className="md:hidden" />
        <Link href="/" className="text-muted-foreground hover:text-foreground hover:underline">
          問題一覧
        </Link>
        <Link
          href="/library"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          ライブラリ
        </Link>
        <Link
          href="/solution"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          解法
        </Link>
        <Link
          href="/tips"
          className="text-muted-foreground hover:text-foreground hover:underline"
        >
          Tips
        </Link>
      </nav>
    </header>
  )
}