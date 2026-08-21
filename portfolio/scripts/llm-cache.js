// 既存の scripts/*.js と同様に CommonJS で実装するため require() を使用する
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs")
const path = require("path")

const CACHE_DIR = path.join(__dirname, ".cache")
const CACHE_FILE = path.join(CACHE_DIR, "llm-reviews.json")
const CACHE_SCHEMA_VERSION = "v2"

/**
 * LLM レビューキャッシュを読み込む。存在しない場合は空オブジェクトを返す
 * @returns {Record<string, unknown>}
 */
function loadCache() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"))
      if (data && data.items) {
        return data.items
      }
    } catch (e) {
      console.warn("LLM レビューキャッシュの読み込みに失敗しました:", e.message)
    }
  }
  return {}
}

/**
 * LLM レビューキャッシュを保存する
 * @param {Record<string, unknown>} cacheItems
 */
function saveCache(cacheItems) {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }
  const payload = {
    version: CACHE_SCHEMA_VERSION,
    items: cacheItems,
  }
  fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2), "utf-8")
}

module.exports = { CACHE_SCHEMA_VERSION, loadCache, saveCache }