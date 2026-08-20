/** アルゴリズム・ロジックの改善アドバイス */
export interface AlgorithmImprovement {
  /** 改善の余地があるかどうか（false の場合は「すでに最適」） */
  hasImprovement: boolean
  /** ボトルネックの簡潔な説明 */
  bottleneck?: string
  /** 改善方針・解説 */
  suggestion?: string
  /** 改善前のコード該当箇所（数行のスニペット） */
  beforeSnippet?: string
  /** 改善後の推奨コード（数行のスニペット） */
  afterSnippet?: string
}

/** LLM (Gemini) による自動コードレビュー・タグ評価 */
export interface AiReview {
  complexity: string
  rating: string
  summary: string
  tags: string[]
  /** アルゴリズム・ロジックの改善アドバイス */
  improvement?: AlgorithmImprovement
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
