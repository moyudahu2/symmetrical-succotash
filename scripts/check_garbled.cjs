const fs = require('fs')
const content = fs.readFileSync('src/components/Quiz.jsx', 'utf8')
const lines = content.split('\n')
lines.forEach((line, i) => {
  // Check if line has Chinese chars
  if (/[\u4e00-\u9fff]/.test(line)) {
    // Check each Chinese char against common known-good set
    const chineseChars = line.match(/[\u4e00-\u9fff]/g)
    if (chineseChars) {
      const suspicious = chineseChars.filter(c => c.charCodeAt(0) < 0x4e00 || c.charCodeAt(0) > 0x9fff || c.charCodeAt(0) >= 0x8000)
      if (suspicious.length > 0) {
        console.log(`L${i + 1}: ${line.trim().slice(0, 80)}`)
      }
    }
  }
})
