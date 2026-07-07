const fs = require("fs")
const path = require("path")

function collectProblemsData(baseRoot = path.join(__dirname, "..", "..", "problems")) {
  const results = []
  const abcBaseDir = path.join(baseRoot, "ABC")
  const typicalBaseDir = path.join(baseRoot, "典型")

  if (fs.existsSync(abcBaseDir)) {
    const abcDirs = fs
      .readdirSync(abcBaseDir)
      .filter((file) => fs.statSync(path.join(abcBaseDir, file)).isDirectory())
      .sort((a, b) => (a > b ? -1 : 1))

    abcDirs.forEach((abc) => {
      const dirPath = path.join(abcBaseDir, abc)
      const readmePath = path.join(dirPath, "README.md")

      if (!fs.existsSync(readmePath)) return

      const readmeContent = fs.readFileSync(readmePath, "utf-8")
      const sections = readmeContent.split(/(?=## [A-G]問題)/)

      const rawSummary = sections.shift() || ""
      const contestSummary = rawSummary.replace(/^#\s+.+\r?\n?/, "").trim()

      const problems = []

      sections.forEach((section) => {
        const headerMatch = section.match(/## ([A-G])問題/)

        if (headerMatch) {
          const problemId = headerMatch[1]
          const problemTitle = `${problemId}問題`

          const cppFileName = `${problemId}.cpp`
          const cppFilePath = path.join(dirPath, cppFileName)
          let cppContent = ""

          if (fs.existsSync(cppFilePath)) {
            cppContent = fs.readFileSync(cppFilePath, "utf-8")
          }

          const body = section.replace(/## [A-G]問題/, "").trim()

          problems.push({
            id: problemId,
            title: problemTitle,
            cpp: cppContent,
            content: body,
          })
        }
      })

      results.push({
        abc,
        summary: contestSummary.trim(),
        problems,
      })
    })
  }

  if (fs.existsSync(typicalBaseDir)) {
    const cppFiles = fs
      .readdirSync(typicalBaseDir)
      .filter((file) => file.endsWith(".cpp") && file !== "main.cpp")
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

    const problems = cppFiles.map((file) => {
      const id = file.replace(/\.cpp$/, "")
      const cppFilePath = path.join(typicalBaseDir, file)
      const cppContent = fs.readFileSync(cppFilePath, "utf-8")

      return {
        id,
        title: `典型 ${id}`,
        cpp: cppContent,
        content: "典型90問の解法メモです。",
      }
    })

    results.push({
      abc: "典型",
      summary: "典型90問などの典型問題をまとめたセクションです。",
      problems,
    })
  }

  return results
}

if (require.main === module) {
  const baseRoot = path.join(__dirname, "..", "..", "problems")
  const results = collectProblemsData(baseRoot)
  const outputPath = path.join(__dirname, "..", "public", "problems.json")
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8")

  console.log(`completed tasks. outputed at ${outputPath}`)
}

module.exports = { collectProblemsData }
