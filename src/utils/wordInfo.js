import wordsData from '../data/words'

const ROOT_MAP = [
  { pattern: /^(un|in|im|il|ir|dis|non|mis|anti)(.+)/, tip: (root, base) => `前缀"${root}"表否定，"${root}${base}" → "不${base}" 的含义` },
  { pattern: /^re(.+)/, tip: (_, base) => `前缀"re-"表"再次/重新"，"re${base}" → "再次${base}"` },
  { pattern: /^pre(.+)/, tip: (_, base) => `前缀"pre-"表"在...之前"，"pre${base}" → "预先${base}"` },
  { pattern: /^over(.+)/, tip: (_, base) => `前缀"over-"表"过度/超过"，"over${base}" → "过度${base}"` },
  { pattern: /^under(.+)/, tip: (_, base) => `前缀"under-"表"在...之下/不足"，"under${base}" → "${base}不足"` },
  { pattern: /^out(.+)/, tip: (_, base) => `前缀"out-"表"超过/在外"，"out${base}" → "超越${base}"` },
  { pattern: /^co(.+)/, tip: (_, base) => `前缀"co-"表"共同/一起"，"co${base}" → "共同${base}"` },
  { pattern: /^trans(.+)/, tip: (_, base) => `前缀"trans-"表"跨越/变换"，"trans${base}" → "跨越${base}"` },
  { pattern: /^sub(.+)/, tip: (_, base) => `前缀"sub-"表"在...之下/次级"，"sub${base}" → "次级${base}"` },
  { pattern: /^inter(.+)/, tip: (_, base) => `前缀"inter-"表"在...之间/相互"，"inter${base}" → "相互${base}"` },
  { pattern: /^super(.+)/, tip: (_, base) => `前缀"super-"表"超级/超越"，"super${base}" → "超级${base}"` },
  { pattern: /^multi(.+)/, tip: (_, base) => `前缀"multi-"表"多"，"multi${base}" → "多${base}"` },
  { pattern: /^semi(.+)/, tip: (_, base) => `前缀"semi-"表"半"，"semi${base}" → "半${base}"` },
  { pattern: /^tri(.+)/, tip: (_, base) => `前缀"tri-"表"三"，"tri${base}" → "三${base}"` },
  { pattern: /^bi(.+)/, tip: (_, base) => `前缀"bi-"表"双/二"，"bi${base}" → "双${base}"` },
  { pattern: /(.+)less$/, tip: (_, base) => `后缀"-less"表"无/没有"，"${base}less" → "无${base}"` },
  { pattern: /(.+)ful$/, tip: (_, base) => `后缀"-ful"表"充满...的"，"${base}ful" → "充满${base}的"` },
  { pattern: /(.+)able$/, tip: (_, base) => `后缀"-able"表"可...的"，"${base}able" → "可${base}的"` },
  { pattern: /(.+)tion$/, tip: (_, base) => `后缀"-tion"将动词变为名词，"${base}tion" → "${base}的行为/状态"` },
  { pattern: /(.+)sion$/, tip: (_, base) => `后缀"-sion"将动词变为名词，"${base}sion" → "${base}的行为/结果"` },
  { pattern: /(.+)ment$/, tip: (_, base) => `后缀"-ment"将动词变为名词，"${base}ment" → "${base}的行为/结果"` },
  { pattern: /(.+)ness$/, tip: (_, base) => `后缀"-ness"将形容词变为名词，"${base}ness" → "${base}的状态"` },
  { pattern: /(.+)ly$/, tip: (_, base) => `后缀"-ly"将形容词变为副词，"${base}ly" → "${base}地"` },
  { pattern: /(.+)ize$/, tip: (_, base) => `后缀"-ize"表"使...化"，"${base}ize" → "使${base}化"` },
  { pattern: /(.+)ify$/, tip: (_, base) => `后缀"-ify"表"使...成为"，"${base}ify" → "使成为${base}"` },
  { pattern: /(.+)ive$/, tip: (_, base) => `后缀"-ive"表"有...性质的"，"${base}ive" → "有${base}性质的"` },
  { pattern: /(.+)ous$/, tip: (_, base) => `后缀"-ous"表"充满...的"，"${base}ous" → "充满${base}的"` },
  { pattern: /(.+)al$/, tip: (_, base) => `后缀"-al"表"与...有关的"，"${base}al" → "与${base}有关的"` },
  { pattern: /(.+)er$/, tip: (_, base) => `后缀"-er"表"做...的人/物"，"${base}er" → "做${base}的人"` },
  { pattern: /(.+)or$/, tip: (_, base) => `后缀"-or"表"做...的人/物"，"${base}or" → "做${base}的人"` },
  { pattern: /(.+)ist$/, tip: (_, base) => `后缀"-ist"表"...家/主义者"，"${base}ist" → "${base}家"` },
  { pattern: /(.+)ism$/, tip: (_, base) => `后缀"-ism"表"...主义/学说"，"${base}ism" → "${base}主义"` },
  { pattern: /(.+)dom$/, tip: (_, base) => `后缀"-dom"表"...的状态/领域"，"${base}dom" → "${base}领域"` },
  { pattern: /(.+)ship$/, tip: (_, base) => `后缀"-ship"表"...的身份/关系"，"${base}ship" → "${base}关系"` },
  { pattern: /(.+)ward$/, tip: (_, base) => `后缀"-ward"表"向...方向"，"${base}ward" → "向${base}方向"` },
]

function getRootTip(word) {
  const wordStr = (typeof word === 'string' ? word : word?.word || '').toLowerCase()
  for (const { pattern, tip } of ROOT_MAP) {
    const m = wordStr.match(pattern)
    if (m) {
      const base = m[2] || m[1]
      if (base.length >= 2) return tip(m[1] || '', base)
    }
  }
  return null
}

function getRelatedWords(word, limit = 6) {
  const defTokens = word.definition.replace(/[的 了 与]/g, '').split(/\s+/).filter(Boolean)
  const samePos = wordsData.filter(w => w.id !== word.id && w.pos === word.pos)
  const scored = samePos.map(w => {
    const tokens = w.definition.split(/\s+/)
    const score = tokens.filter(t => defTokens.some(d => t.includes(d) || d.includes(t))).length
    return { word: w, score }
  })
  const matched = scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, limit)
  if (matched.length >= 3) return matched.map(s => s.word)
  const samePosFallback = samePos.slice(0, limit - matched.length)
  return [...matched.map(s => s.word), ...samePosFallback]
}

export function getWordImageUrl(word) {
  return `https://picsum.photos/seed/word${word.id}/400/300`
}

export function getWordDetail(word) {
  const rootTip = getRootTip(word)
  const relatedWords = getRelatedWords(word, 6)
  return { rootTip, relatedWords }
}
