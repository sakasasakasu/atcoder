import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

import { ScrollArea } from "@/components/ui/scroll-area"
import { getLibrary } from "@/lib/data"

export function LibrarySidebar() {
  const categories = getLibrary()

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="px-4 py-2 text-lg font-bold">ライブラリ</h1>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup />
        <ScrollArea>
          {categories.map((category) => (
            <div key={category.category} className="px-4 py-2">
              <h2 className="text-md py-2 font-semibold">{category.category}</h2>
              <ul>
                {category.items.map((item) => (
                  <div key={item.id}>
                    <li className="px-4 py-2 text-sm">
                      <a
                        className="text-blue-500 hover:underline"
                        href={`#${category.category}-${item.id}`}
                      >
                        {item.title}
                      </a>
                    </li>
                    <Separator className="my-2" />
                  </div>
                ))}
              </ul>
            </div>
          ))}
        </ScrollArea>
        <SidebarGroup />
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <p className="text-muted-foreground px-4 py-2 text-xs">
          アルゴリズム・データ構造の実装メモ。
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}
