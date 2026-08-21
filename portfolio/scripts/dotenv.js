// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

/**
 * Node.js 実行時に .env ファイルが存在すれば自動読み込みして process.env に適用する
 * 対応するのは `KEY=value` 形式（コメント行・クォート囲み値・既存環境変数の保護に対応）
 */
function loadDotEnv() {
  const envPaths = [
    path.join(__dirname, "..", ".env"),
    path.join(__dirname, "..", "..", ".env"),
  ]
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue
    try {
      const content = fs.readFileSync(envPath, "utf-8")
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith("#")) continue
        const eqIdx = trimmed.indexOf("=")
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim()
          let val = trimmed.slice(eqIdx + 1).trim()
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.slice(1, -1)
          }
          if (!process.env[key]) {
            process.env[key] = val
          }
        }
      }
    } catch (e) {
      console.warn("Failed to load .env file:", e.message)
    }
  }
}

module.exports = { loadDotEnv }