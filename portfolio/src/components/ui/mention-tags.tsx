import { MentionRef } from "@/types/common"

/**
 * バックリンクタグ一覧を表示する共通コンポーネント。
 * 例: 問題カードに「解法: ダイクストラ法」、解法カードに「問題: ABC471 A問題」
 *
 * 生成済みの href は basePath 込みの絶対パスなので、素の <a> で描画する
 * （next/link を使うと basePath が二重付与されるため）
 */
export function MentionTags({
  refs,
  label,
}: {
  refs: MentionRef[]
  label: string
}) {
  if (refs.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 border-t pt-2">
      <span className="text-muted-foreground text-xs">{label}:</span>
      {refs.map((ref) => (
        <a
          key={ref.id}
          href={ref.href}
          className="bg-muted hover:bg-accent hover:text-accent-foreground rounded-full px-2 py-0.5 text-xs transition-colors"
        >
          {ref.label}
        </a>
      ))}
    </div>
  )
}

