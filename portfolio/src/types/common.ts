/** LLM (Gemini) による自動コードレビュー・タグ評価 */
export interface AiReview {
  complexity: string
  rating: string
  summary: string
  tags: string[]
}

/** 1 つのコードファイル（例: A.cpp / A1.cpp） */
export interface CodeFile {
  /** ファイル名の拡張子を除いた表示名（例: A, A1） */
  name: string
  /** コード本文 */
  code: string
  /** コードごとの AI レビュー */
  aiReview?: AiReview
}

/** 言及（メンション）の参照情報 */
export interface MentionRef {
  /** 対象の ID（例: ABC471-A、ダイクストラ法） */
  id: string
  /** 表示ラベル（例: ABC471 A問題） */
  label: string
  /** リンク先（相対 href） */
  href: string
}
