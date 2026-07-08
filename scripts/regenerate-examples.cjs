// Regenerates words.js: each word gets 1 example (curated or auto-generated)
// Rules: ≤12 words, concrete scene, common collocation, colloquial Chinese

const fs = require('fs')
const path = require('path')

// ── Load curated examples ──
const curatedRaw = fs.readFileSync(path.join(__dirname, 'curated_examples.js'), 'utf8')
const CURATED = new Function('module', curatedRaw + '; return module.exports;')({ exports: {} })

// ── Concrete nouns for use in auto-generated examples ──
const COMMON_NOUNS = [
  'desk', 'chair', 'door', 'window', 'book', 'pen', 'phone', 'computer',
  'table', 'cup', 'bag', 'key', 'car', 'bus', 'train', 'bike',
  'house', 'room', 'garden', 'street', 'shop', 'park', 'school', 'office',
  'water', 'food', 'bread', 'milk', 'fruit', 'coffee', 'tea', 'juice',
  'hand', 'foot', 'head', 'eye', 'ear', 'face', 'hair', 'mouth',
  'dog', 'cat', 'bird', 'fish', 'tree', 'flower', 'river', 'mountain',
  'sun', 'moon', 'star', 'rain', 'snow', 'wind', 'cloud', 'sky',
  'money', 'watch', 'clock', 'ring', 'hat', 'coat', 'shirt', 'shoe',
  'bed', 'wall', 'floor', 'roof', 'bridge', 'road', 'street', 'gate',
]

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

// ── Auto-generate one example per word ──
function generateExample(word) {
  const w = word.word
  const lower = w.toLowerCase()
  const pos = (word.pos || '').toLowerCase().replace('.', '')
  const def = word.definition || ''
  const defWord = def.split(/[\s　]+/)[0] || w

  // Use curated if available
  if (CURATED[lower]) {
    const { e, c } = CURATED[lower]
    return { example: e, exampleTranslation: c }
  }

  const n = pick(COMMON_NOUNS)

  // Verb
  if (pos.startsWith('v')) {
    const patterns = [
      { e: `I need to ${lower} this ${n} before noon.`, c: `我需要中午前${defWord}这个${n}。` },
      { e: `Can you ${lower} the ${n} for me?`, c: `你能帮我${defWord}这个${n}吗？` },
      { e: `She ${lower}ed the ${n} this morning.`, c: `她今天早上${defWord}了那个${n}。` },
      { e: `He always ${lower}s his ${n} after work.`, c: `他下班后总是${defWord}他的${n}。` },
      { e: `Don't forget to ${lower} the ${n}.`, c: `别忘了${defWord}那个${n}。` },
      { e: `We need to ${lower} this ${n} right now.`, c: `我们需要现在${defWord}这个${n}。` },
    ]
    return pick(patterns)
  }

  // Noun
  if (pos.startsWith('n')) {
    const patterns = [
      { e: `I bought a new ${lower} from the store.`, c: `我从店里买了一个新的${defWord}。` },
      { e: `The ${lower} is on the ${n} over there.`, c: `${defWord}在那边的${n}上。` },
      { e: `Can you pass me the ${lower}?`, c: `你能把${defWord}递给我吗？` },
      { e: `There is a ${lower} in the ${n}.`, c: `${n}里有一个${defWord}。` },
      { e: `I really like this ${lower}.`, c: `我真的很喜欢这个${defWord}。` },
      { e: `We looked at the ${lower} together.`, c: `我们一起看了那个${defWord}。` },
    ]
    return pick(patterns)
  }

  // Adjective
  if (pos.startsWith('adj') || pos.startsWith('adv')) {
    const adj = pos.startsWith('adj') ? lower : lower.replace(/ly$/, '')
    const patterns = [
      { e: `This ${n} feels very ${lower}.`, c: `这个${n}感觉很${defWord}。` },
      { e: `That's a ${lower} ${n} you have there.`, c: `你那个${n}挺${defWord}的。` },
      { e: `The ${n} looks so ${lower} today.`, c: `今天这个${n}看起来${defWord}。` },
      { e: `I think this ${n} is ${lower}.`, c: `我觉得这个${n}挺${defWord}的。` },
      { e: `She bought a ${lower} ${n} at the market.`, c: `她在市场买了一个${defWord}的${n}。` },
      { e: `The weather is ${lower} this morning.`, c: `今天早上天气挺${defWord}的。` },
    ]
    return pick(patterns)
  }

  // Other (prep, conj, etc.)
  return {
    example: `I think ${lower} is the best way to do it.`,
    exampleTranslation: `我觉得${defWord}是做事的最好方式。`,
  }
}

// ── Read current words.js ──
const wordsPath = path.join(__dirname, '..', 'src', 'data', 'words.js')
const content = fs.readFileSync(wordsPath, 'utf8')
const match = content.match(/\[([\s\S]*)\]/)
if (!match) { console.error('Could not parse words.js'); process.exit(1) }

const wordData = JSON.parse(match[1])
console.log('Loaded', wordData.length, 'words')

// ── Generate ──
const updated = wordData.map(w => {
  const { example: oldExample, exampleTranslation: oldTrans, examples, ...rest } = w
  const gen = generateExample(w)
  return { ...rest, example: gen.example, exampleTranslation: gen.exampleTranslation }
})

// ── Write ──
const outPath = path.join(__dirname, '..', 'src', 'data', 'words.js')
const code = `const words = ${JSON.stringify(updated)}
export default words`
fs.writeFileSync(outPath, code, 'utf8')
console.log('Done! Wrote', updated.length, 'words to', outPath)
