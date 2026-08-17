/** 1 件の Tips（短いメモ） */
export interface Tip {
  id: string
  title: string
  content: string
}

export interface TipCategory {
  category: string
  items: Tip[]
}
