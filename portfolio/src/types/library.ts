export interface LibraryItem {
  id: string
  title: string
  content: string
  cpp: string
}

export interface LibraryCategory {
  category: string
  items: LibraryItem[]
}
