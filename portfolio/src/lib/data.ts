import fs from "fs"
import path from "path"
import { Contest } from "@/types/contest"
import { LibraryCategory } from "@/types/library"
import { SolutionCategory } from "@/types/solution"
import { TipCategory } from "@/types/tip"

export function getContests(): Contest[] {
  const jsonPath = path.join(process.cwd(), "public", "problems.json")
  if (!fs.existsSync(jsonPath)) {
    return []
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Contest[]
}

export function getLibrary(): LibraryCategory[] {
  const jsonPath = path.join(process.cwd(), "public", "library.json")
  if (!fs.existsSync(jsonPath)) {
    return []
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as LibraryCategory[]
}

export function getSolutions(): SolutionCategory[] {
  const jsonPath = path.join(process.cwd(), "public", "solutions.json")
  if (!fs.existsSync(jsonPath)) {
    return []
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as SolutionCategory[]
}

export function getTips(): TipCategory[] {
  const jsonPath = path.join(process.cwd(), "public", "tips.json")
  if (!fs.existsSync(jsonPath)) {
    return []
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as TipCategory[]
}
