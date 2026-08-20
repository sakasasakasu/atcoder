import { CodeFile, MentionRef } from "./common"

export interface DifficultyColor {
  label: string
  colorClass: string
  hex: string
}

export interface Problem {
  id: string
  title: string
  content: string
  codes: CodeFile[]
  /** この問題が言及している解法（前方リンク） */
  mentions: MentionRef[]
  /** この問題を言及している解法（バックリンク＝タグ） */
  referencedBy: MentionRef[]

  /** AtCoder Problems の diff (推定レート) */
  difficulty?: number
  /** レートに対応した難易度カラー表現 */
  difficultyColor?: DifficultyColor
  /** AtCoder 公式問題ページ URL */
  url?: string
  /** AtCoder Problems コンテストページ URL */
  problemsUrl?: string
}

export interface Contest {
  abc: string
  summary: string
  /** 典型形式（直下の .cpp = 1 問題）なら true */
  flat: boolean
  problems: Problem[]
}
