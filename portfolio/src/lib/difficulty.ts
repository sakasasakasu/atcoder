import type { DifficultyColor } from "@/types/contest"

/**
 * AtCoder 難易度帯の閾値と色（scripts/atcoder-api.js の getDifficultyColor と一致させること）
 */
const DIFFICULTY_RATES = [
  { min: 0, max: 400, color: "#808080" }, // 灰
  { min: 400, max: 800, color: "#804000" }, // 茶
  { min: 800, max: 1200, color: "#008000" }, // 緑
  { min: 1200, max: 1600, color: "#00C0C0" }, // 水
  { min: 1600, max: 2000, color: "#0000FF" }, // 青
  { min: 2000, max: 2400, color: "#C0C000" }, // 黄
  { min: 2400, max: 2800, color: "#FF8000" }, // 橙
] as const

const RED_COLOR = "#FF0000" // 赤 (2800+)

/**
 * Diff の値から「下から上に水のように色が満ちていく」円のスタイルを生成する。
 * 生成済みの difficultyColor（problems.json に同梱）があればその色を優先する
 */
export function getDiffCircleStyle(
  difficulty?: number,
  difficultyColor?: DifficultyColor,
) {
  if (difficulty === undefined || difficulty === null) {
    return {
      style: {
        borderColor: "#888888",
        background: "transparent",
      },
      label: "Unrated",
    }
  }

  const val = Math.max(0, Math.round(difficulty))

  let color: string = RED_COLOR
  let pct = 100

  if (val < 2800) {
    for (const r of DIFFICULTY_RATES) {
      if (val >= r.min && val < r.max) {
        color = difficultyColor?.hex ?? r.color
        pct = Math.max(0, Math.min(100, Math.round(((val - r.min) / (r.max - r.min)) * 100)))
        break
      }
    }
  }

  return {
    style: {
      borderColor: color,
      background: `linear-gradient(to top, ${color} 0%, ${color} ${pct}%, transparent ${pct}%, transparent 100%)`,
    },
    label: `Difficulty: ${val}`,
  }
}