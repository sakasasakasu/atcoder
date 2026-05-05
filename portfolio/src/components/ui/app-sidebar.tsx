import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

import fs from "fs"
import path from "path"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

interface Problem {
  id: string
  title: string
  content: string
  cpp?: string
}

interface Contest {
  abc: string
  summary: string
  problems: Problem[]
}

export function AppSidebar() {
  const jsonPath = path.join(process.cwd(), "public", "problems.json")
  const contests = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Contest[]

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
              <h2 className="text-md font-semibold">{contest.abc}</h2>
              <ul>
                {contest.problems.map((problem) => (
                  <div key={problem.id}>
                    <li className="px-4 py-2 text-sm">
                    <a className="text-blue-500 hover:underline">
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
        <p className="px-4 py-2 text-xs text-muted-foreground">
          AtCoder精進
        </p>
      </SidebarFooter>
    </Sidebar>
  )
}