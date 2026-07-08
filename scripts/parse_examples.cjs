const fs = require('fs')
const path = require('path')

const text = fs.readFileSync('C:/Users/jyc27/Desktop/大学英语四级例句.txt', 'utf8')
const lines = text.split(/\r?\n/).filter(l => l.trim() && !l.startsWith('===') && !l.startsWith('来源：'))

const entries = []
let i = 0
while (i + 2 < lines.length) {
  const word = lines[i++].trim().toLowerCase()
  const example = lines[i++].trim()
  const translation = lines[i++].trim()
  if (word && example && translation) {
    entries.push({ word, example, translation })
  }
}

const outPath = path.join(__dirname, 'curated_examples.js')
const pairs = entries.map(e => {
  const esc = s => JSON.stringify(s)
  return `  ${JSON.stringify(e.word)}: { e: ${esc(e.example)}, c: ${esc(e.translation)} }`
}).join(',\n')

const code = `// Curated CET-4 examples (from 大学英语四级例句.txt, ${entries.length} entries)\n// word -> { e: English (concrete, <=12 words), c: Chinese (colloquial) }\nconst CURATED = {\n${pairs},\n}\nmodule.exports = CURATED\n`

fs.writeFileSync(outPath, code, 'utf8')
console.log('Written', entries.length, 'entries to', outPath)
