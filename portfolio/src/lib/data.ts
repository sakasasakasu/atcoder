import fs from "fs"
import path from "path"
import { Contest } from "@/types/contest"
import { LibraryCategory } from "@/types/library"
import { SolutionCategory } from "@/types/solution"
import { TipCategory } from "@/types/tip"

/**
 * public/ 配下の生成済み JSON を読み込む共通ヘルパー。
 * ファイルが存在しない場合（生成前など）は空配列を返す
 */
function readJson<T>(fileName: string): T[] {
  const jsonPath = path.join(process.cwd(), "public", fileName)
  if (!fs.existsSync(jsonPath)) {
    return []
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as T[]
}

export function getContests(): Contest[] {
  return readJson<Contest>("problems.json")
}

export function getLibrary(): LibraryCategory[] {
  return readJson<LibraryCategory>("library.json")
}

export function getSolutions(): SolutionCategory[] {
  return readJson<SolutionCategory>("solutions.json")
}

export function getTips(): TipCategory[] {
  return readJson<TipCategory>("tips.json")
}
