/**
 * 計算量文字列（例: "O(N log N)"）を KaTeX 数式（例: "$O(N \log N)$"）に整形する
 */
export function formatComplexityToTex(complexity?: string) {
  if (!complexity) return ""
  let text = complexity.trim()
  if (text.startsWith("$") && text.endsWith("$")) {
    return text
  }
  // log を \log に置換
  text = text.replace(/(?<!\\)log/gi, "\\log ")
  return `$${text}$`
}