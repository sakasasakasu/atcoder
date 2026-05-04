import fs from "fs"
import path from "path"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"
import { Code } from "@/components/ui/code"

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
    <main className="container mx-auto py-10 space-y-10 px-4 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">AtCoderの精進</h1>
        </div>
        <Separator />
      </header>

      <section className="space-y-8">
        {contests.map((contest: Contest) => (
          <Card key={contest.abc}>
            <CardHeader>
              <CardTitle>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  {contest.abc}
                </h1>
              </CardTitle>
              <CardDescription>
                {contest.summary}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {contest.problems.map((prob: Problem, index: number) => (
                <article key={prob.id} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold tracking-tight text-foreground">{prob.title}</h3>
                  </div>

                  <p className="text-muted-foreground whitespace-pre-wrap leading-7">{prob.content}</p>

                  {prob.cpp && (
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={`${contest.abc}-${prob.id}`} className="border-b-0">
                        <AccordionTrigger className="text-sm font-medium hover:no-underline py-2 px-4 rounded-md">
                          解答を見る
                        </AccordionTrigger>
                        <AccordionContent className="pt-4">
                          <Code code={prob.cpp} language="cpp"/>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                  {index < contest.problems.length - 1 && <Separator className="mt-6"/>}
                </article>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}