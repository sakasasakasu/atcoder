import { CodeFile, MentionRef } from "./common"

export interface Problem {
  id: string
  title: string
  content: string
  codes: CodeFile[]
  /** この問題が言及している解法（前方リンク） */
  mentions: MentionRef[]
  /** この問題を言及している解法（バックリンク＝タグ） */
  referencedBy: MentionRef[]
}

export interface Contest {
  abc: string
  summary: string
  problems: Problem[]
}
