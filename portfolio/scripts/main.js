const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', '..', 'problems');
const results = [];

if (!fs.existsSync(baseDir)) {
    console.error(`Error: ${baseDir} was not found.`);
    process.exit(1);
}

const abcDirs = fs.readdirSync(baseDir).filter(file => 
    fs.statSync(path.join(baseDir, file)).isDirectory())
    .sort((a,b) => (a > b ? -1 : 1));

abcDirs.forEach(abc => {
    const dirPath = path.join(baseDir, abc);
    const readmePath = path.join(dirPath, 'README.md');

    if (!fs.existsSync(readmePath)) return;

    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const sections = readmeContent.split(/(?=## [A-G]問題)/);

    const rawSummary = sections.shift() || "";
    const contestSummary = rawSummary //見出しから#を削除してトリミング
    .replace(/^#\s+.+\r?\n?/, "")
    .trim();

    const problems = [];

    sections.forEach(section => {
        const headerMatch = section.match(/## ([A-G])問題/);
        
        if (headerMatch) {
            const problemId = headerMatch[1];
            const problemTitle = `${problemId}問題`;

            const cppFileName = `${problemId}.cpp`;
            const cppFilePath = path.join(dirPath, cppFileName);
            let cppContent = '';

            if (fs.existsSync(cppFilePath)) {
                cppContent = fs.readFileSync(cppFilePath, 'utf-8');
            }

            const body = section.replace(/## [A-G]問題/, '').trim();

            problems.push({
                id: problemId,
                title: problemTitle,
                cpp: cppContent,
                content: body
            });
        }
    });

    results.push({
        abc,
        summary: contestSummary.trim(),
        problems
    });
});

const outputPath = path.join(__dirname, '..', 'public', 'problems.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

console.log(`completed tasks. outputed at ${outputPath}`);