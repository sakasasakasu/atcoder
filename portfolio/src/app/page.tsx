import fs from "fs"
import path from "path"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Code } from "@/components/ui/code"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import ReactMarkdown from 'react-markdown'
import { AppSidebar } from "@/components/ui/app-sidebar"

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
        <SidebarProvider>
          <AppSidebar />
          <main>
            <div className="p-4">
            </div>
          </main>
        </SidebarProvider>
  );
}