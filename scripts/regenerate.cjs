const fs = require('fs')
const path = require('path')

// Load curated
const curatedRaw = fs.readFileSync(path.join(__dirname, 'curated_examples.js'), 'utf8')
const CURATED = new Function('module', curatedRaw + '; return module.exports;')({ exports: {} })

const COMMON_NOUNS = ['desk','chair','door','window','book','pen','phone','computer','table','cup','bag','key','car','bus','train','bike','house','room','garden','street','shop','park','school','office','water','food','bread','milk','fruit','coffee','tea','juice','hand','foot','head','eye','ear','face','hair','mouth','dog','cat','bird','fish','tree','flower','river','mountain','sun','moon','star','rain','snow','wind','cloud','sky','money','watch','clock','ring','hat','coat','shirt','shoe']

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }

function generateExample(word) {
  const w = word.word
  const lower = w.toLowerCase()
  const pos = (word.pos || '').toLowerCase().replace('.', '')
  const def = word.definition || ''
  const defWord = def.split(/[\s\u3000]+/)[0] || w

  if (CURATED[lower]) {
    const c = CURATED[lower]
    return { example: c.e, exampleTranslation: c.c }
  }

  const n = pick(COMMON_NOUNS)

  if (pos.startsWith('v')) {
    const p = [
      { example: `I need to ${lower} this ${n} before noon.`, exampleTranslation: `我需要中午前${defWord}这个${n}。` },
      { example: `Can you ${lower} the ${n} for me?`, exampleTranslation: `你能帮我${defWord}这个${n}吗？` },
      { example: `She ${lower}ed the ${n} this morning.`, exampleTranslation: `她今天早上${defWord}了那个${n}。` },
    ]
    return pick(p)
  }
  if (pos.startsWith('n')) {
    const p = [
      { example: `I bought a new ${lower} from the store.`, exampleTranslation: `我从店里买了一个新的${defWord}。` },
      { example: `The ${lower} is on the ${n} over there.`, exampleTranslation: `${defWord}在那边的${n}上。` },
      { example: `Can you pass me the ${lower}?`, exampleTranslation: `你能把${defWord}递给我吗？` },
    ]
    return pick(p)
  }
  if (pos.startsWith('adj') || pos.startsWith('adv')) {
    const p = [
      { example: `This ${n} feels very ${lower}.`, exampleTranslation: `这个${n}感觉很${defWord}。` },
      { example: `That is a ${lower} ${n} you have there.`, exampleTranslation: `你那个${n}挺${defWord}的。` },
      { example: `The ${n} looks so ${lower} today.`, exampleTranslation: `今天这个${n}看起来${defWord}。` },
    ]
    return pick(p)
  }
  return { example: `I think ${lower} is the best way to do it.`, exampleTranslation: `我觉得${defWord}是做事的最好方式。` }
}

const wordsPath = path.join(__dirname, '..', 'src', 'data', 'words.js')
const content = fs.readFileSync(wordsPath, 'utf8')
const idx = content.indexOf('[')
const lastIdx = content.lastIndexOf(']')
const wordData = JSON.parse(content.slice(idx, lastIdx + 1))
console.log('Loaded', wordData.length, 'words')

const updated = wordData.map(w => {
  const { example: _, exampleTranslation: __, examples: ___, ...rest } = w
  const gen = generateExample(w)
  return { ...rest, example: gen.example, exampleTranslation: gen.exampleTranslation }
})

const code = 'const words = ' + JSON.stringify(updated) + '\nexport default words'
fs.writeFileSync(wordsPath, code, 'utf8')
console.log('Written', updated.length, 'words to words.js')
