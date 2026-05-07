import fs from "fs"
import path from "path"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Code } from "@/components/ui/code"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/app-sidebar"
import { ContestCard } from "@/components/ui/contest-card"

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

export default function Home() {
  const jsonPath = path.join(process.cwd(), "public", "problems.json")
  const contests = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Contest[]

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 space-y-6 p-6">
          <h1 className="mb-4 text-2xl font-bold">Contest Archive</h1>
          <div className="grid gap-6">
            {/* 全てのコンテストをリスト表示 */}
            {contests.map((contest, index) => (
              <ContestCard key={index} contest={contest} />
            ))}
          </div>
        </main>
      </SidebarProvider>
    </>
  )
}
