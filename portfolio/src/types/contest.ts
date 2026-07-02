export interface Problem {
  id: string
  title: string
  content: string
  cpp?: string
}

export interface Contest {
  abc: string
  summary: string
  problems: Problem[]
}
