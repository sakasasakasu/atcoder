import fs from "fs"
import path from "path"
import { Contest } from "@/types/contest"

export function getContests(): Contest[] {
  const jsonPath = path.join(process.cwd(), "public", "problems.json")
  if (!fs.existsSync(jsonPath)) {
    return []
  }
  return JSON.parse(fs.readFileSync(jsonPath, "utf8")) as Contest[]
}
