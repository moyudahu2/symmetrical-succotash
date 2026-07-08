const fs = require('fs')
const path = require('path')

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8')
  const lines = content.split('\n')
  const issues = []
  
  // Known correct Chinese phrases that might appear
  const known = ['正确','错误','下一题','查看结果','即将跳转','再来一轮','摸鱼大师','太棒了','不错','加油','需要多加复习','别灰心','多练习']

  lines.forEach((line, i) => {
    // Skip comments and markdown
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) return
    
    // Check for Chinese-like characters that aren't in the standard CJK range
    const matches = line.match(/[\ud800-\udfff\u2e80-\u2eff\u2f00-\u2fdf\u3100-\u312f]/g)
    if (matches) {
      issues.push({ line: i + 1, text: line.trim().slice(0, 80), chars: matches.slice(0, 10) })
    }
  })
  
  return issues
}

const srcRoot = 'src'
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory() && e.name !== 'data') walk(p)
    else if (e.isFile() && /\.(jsx?|tsx?)$/.test(e.name)) {
      const issues = scanFile(p)
      if (issues.length > 0) {
        console.log(`\n=== ${p} ===`)
        issues.forEach(i => console.log(`  L${i.line}: ${i.text}`))
      }
    }
  }
}
walk(srcRoot)
