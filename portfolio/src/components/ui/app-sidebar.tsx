import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"

import { ScrollArea } from "@/components/ui/scroll-area"
import { getContests } from "@/lib/data"

export function AppSidebar() {
  const contests = getContests()

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="px-4 py-2 text-lg font-bold">AtCoder精進</h1>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarGroup />
        <ScrollArea>
          {contests.map((contest) => (
            <div key={contest.abc} className="px-4 py-2">
              <h2 className="text-md py-2 font-semibold">{contest.abc}</h2>
              <ul>
                {contest.problems.map((problem) => (
                  <div key={problem.id}>
                    <li className="px-4 py-2 text-sm">
                      <a
                        className="text-blue-500 hover:underline"
                        href={`#${contest.abc}-${problem.id}`}
                      >
                        {problem.title}
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
        <p className="text-muted-foreground px-4 py-2 text-xs">なんかカッコいい文章を書く。</p>
      </SidebarFooter>
    </Sidebar>
  )
}
