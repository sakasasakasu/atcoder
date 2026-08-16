import { CodeFile, MentionRef } from "./common"

export interface Solution {
  id: string
  title: string
  content: string
  codes: CodeFile[]
  /** この解法が言及している問題（前方リンク） */
  mentions: MentionRef[]
  /** この解法を言及している問題（バックリンク＝タグ） */
  referencedBy: MentionRef[]
}
