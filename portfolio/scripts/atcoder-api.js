/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const CACHE_DIR = path.join(__dirname, ".cache")
const CACHE_FILE = path.join(CACHE_DIR, "problem-models.json")
const API_URL = "https://kenkoooo.com/atcoder/resources/problem-models.json"

/**
 * AtCoder Problems の内部 difficulty を表示用 rating (400未満の補正値対応) に変換します
 * @param {number | undefined | null} difficulty 
 * @returns {number | null}
 */
function getDisplayDifficulty(difficulty) {
  if (difficulty === undefined || difficulty === null) return null
  if (difficulty >= 400) {
    return Math.round(difficulty)
  }
  // AtCoder Problems の 400 未満補正ロジック: 400 / exp((400 - diff) / 400)
  return Math.max(1, Math.round(400 / Math.exp((400 - difficulty) / 400)))
}

/**
 * AtCoder Problems の rating に基づき難易度カラー情報を返します
 * @param {number | undefined | null} displayDifficulty 
 * @returns {{ label: string, colorClass: string, hex: string }}
 */
function getDifficultyColor(displayDifficulty) {
  if (displayDifficulty === undefined || displayDifficulty === null) {
    return {
      label: "Unrated",
      colorClass: "text-muted-foreground border-border bg-muted/30",
      hex: "#888888",
    }
  }

  const val = Math.max(0, Math.round(displayDifficulty))

  if (val < 400) return { label: "灰", colorClass: "text-neutral-500 dark:text-neutral-400 border-neutral-400/30 bg-neutral-500/10", hex: "#808080" }
  if (val < 800) return { label: "茶", colorClass: "text-amber-700 dark:text-amber-500 border-amber-600/30 bg-amber-500/10", hex: "#804000" }
  if (val < 1200) return { label: "緑", colorClass: "text-emerald-600 dark:text-emerald-500 border-emerald-500/30 bg-emerald-500/10", hex: "#008000" }
  if (val < 1600) return { label: "水", colorClass: "text-cyan-600 dark:text-cyan-500 border-cyan-500/30 bg-cyan-500/10", hex: "#00C0C0" }
  if (val < 2000) return { label: "青", colorClass: "text-blue-600 dark:text-blue-500 border-blue-500/30 bg-blue-500/10", hex: "#0000FF" }
  if (val < 2400) return { label: "黄", colorClass: "text-yellow-600 dark:text-yellow-500 border-yellow-500/30 bg-yellow-500/10", hex: "#C0C000" }
  if (val < 2800) return { label: "橙", colorClass: "text-orange-600 dark:text-orange-500 border-orange-500/30 bg-orange-500/10", hex: "#FF8000" }
  return { label: "赤", colorClass: "text-red-600 dark:text-red-500 border-red-500/30 bg-red-500/10", hex: "#FF0000" }
}

/**
 * ABCコンテストIDと問題記号から AtCoder Problems の問題IDを生成
 * 例: contestId="ABC471", problemSymbol="A" => "abc471_a"
 * @param {string} contestId 
 * @param {string} problemSymbol 
 * @returns {string}
 */
function formatProblemId(contestId, problemSymbol) {
  const c = contestId.toLowerCase()
  const p = problemSymbol.toLowerCase()
  return `${c}_${p}`
}

/**
 * AtCoder 公式問題ページの URL を生成
 * @param {string} contestId 
 * @param {string} problemSymbol 
 * @returns {string}
 */
function getAtCoderUrl(contestId, problemSymbol) {
  const c = contestId.toLowerCase()
  const p = formatProblemId(contestId, problemSymbol)
  return `https://atcoder.jp/contests/${c}/tasks/${p}`
}

/**
 * AtCoder Problems のコンテストページ URL を生成
 * @param {string} contestId 
 * @returns {string}
 */
function getAtCoderProblemsUrl(contestId) {
  const c = contestId.toLowerCase()
  return `https://kenkoooo.com/atcoder/#/table/${c}`
}

/**
 * problem-models.json を取得・保存
 * @returns {Promise<Record<string, { difficulty?: number, rawDifficulty?: number, is_experimental?: boolean }>>}
 */
async function fetchProblemModels() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }

  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    const data = await res.json()
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), "utf-8")
    return data
  } catch (err) {
    console.warn("AtCoder Problems API の最新取得に失敗しました。ローカルキャッシュを試みます:", err.message)
    if (fs.existsSync(CACHE_FILE)) {
      try {
        const data = fs.readFileSync(CACHE_FILE, "utf-8")
        return JSON.parse(data)
      } catch (e) {
        console.warn("キャッシュの読み込みにも失敗しました:", e.message)
      }
    }
    return {}
  }
}

/**
 * 問題データ群に Diff (難易度) および公式URL情報を結合します
 * @param {import("./main").Contest[]} contests 
 * @param {Record<string, { difficulty?: number }>} problemModels 
 */
function enrichContestsWithAtCoderData(contests, problemModels) {
  for (const contest of contests) {
    const contestId = contest.abc
    for (const problem of contest.problems) {
      problem.url = getAtCoderUrl(contestId, problem.id)
      problem.problemsUrl = getAtCoderProblemsUrl(contestId)

      const atcoderProblemId = formatProblemId(contestId, problem.id)
      const model = problemModels[atcoderProblemId]

      if (model && model.difficulty !== undefined && model.difficulty !== null) {
        const displayDiff = getDisplayDifficulty(model.difficulty)
        problem.difficulty = displayDiff
        problem.difficultyColor = getDifficultyColor(displayDiff)
      } else {
        problem.difficulty = undefined
        problem.difficultyColor = getDifficultyColor(null)
      }
    }
  }
}

module.exports = {
  enrichContestsWithAtCoderData,
  fetchProblemModels,
  formatProblemId,
  getAtCoderProblemsUrl,
  getAtCoderUrl,
  getDifficultyColor,
  getDisplayDifficulty,
}
