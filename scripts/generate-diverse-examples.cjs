// Generates diverse multi-scenario examples for all CET-4 words
// Run: node scripts/generate-diverse-examples.cjs > src/data/words.js

const fs = require('fs')
const path = require('path')

// ── Sentence pattern templates organized by POS × scenario ──
// {W} = word, {D} = definition fragment

const patterns = {
  verb: {
    daily: [
      { t: "I need to {W} this before the deadline tomorrow.", tone: "neutral" },
      { t: "Can you help me {W} this task? It's driving me crazy.", tone: "humorous" },
      { t: "She always finds a way to {W} things around here.", tone: "neutral" },
      { t: "Don't forget to {W} the documents before the meeting.", tone: "neutral" },
      { t: "He managed to {W} the situation like a true professional.", tone: "formal" },
      { t: "I tried to {W} the problem but it was too complicated.", tone: "neutral" },
      { t: "My mom asked me to {W} the house before guests arrive.", tone: "humorous" },
      { t: "We need to {W} this issue before it gets worse.", tone: "neutral" },
      { t: "The kids love to {W} their grandparents when they visit.", tone: "neutral" },
      { t: "I can't believe he tried to {W} his way out of trouble!", tone: "slang" },
      { t: "Let me {W} the main points so everyone understands.", tone: "neutral" },
      { t: "She knows how to {W} the best out of every situation.", tone: "neutral" },
      { t: "Stop trying to {W} me — I know what you're up to!", tone: "humorous" },
      { t: "The coach told us to {W} harder if we want to win.", tone: "neutral" },
      { t: "I usually {W} my notes after class to remember better.", tone: "neutral" },
    ],
    news: [
      { t: "The committee voted to {W} the new policy next quarter.", tone: "formal" },
      { t: "Authorities continue to {W} the region for safety concerns.", tone: "formal" },
      { t: "The report {W}s a significant shift in consumer behavior.", tone: "formal" },
      { t: "Officials {W}ed their commitment to climate action.", tone: "formal" },
      { t: "The government plans to {W} stricter regulations.", tone: "formal" },
      { t: "Experts {W} that the trend will continue through next year.", tone: "formal" },
      { t: "The new law {W}s all citizens equally under the system.", tone: "formal" },
      { t: "Researchers {W}ed the data and published their findings.", tone: "formal" },
      { t: "The agreement {W}s a milestone in bilateral relations.", tone: "formal" },
      { t: "The organization {W}s aid to affected communities.", tone: "formal" },
      { t: "The summit {W}ed discussions on global trade reform.", tone: "formal" },
      { t: "The court ruling {W}ed a precedent for future cases.", tone: "formal" },
      { t: "The committee will {W} the proposal in next week's session.", tone: "formal" },
      { t: "Officials {W} the new strategy as a major breakthrough.", tone: "formal" },
      { t: "The investigation {W}s multiple violations of protocol.", tone: "formal" },
    ],
    academic: [
      { t: "In your essay, you should {W} your argument with evidence.", tone: "formal" },
      { t: "The experiment aims to {W} the hypothesis under controlled conditions.", tone: "formal" },
      { t: "Scholars often {W} this period as a turning point in history.", tone: "formal" },
      { t: "The study {W}s a strong correlation between diet and health.", tone: "formal" },
      { t: "To {W} the difference, examine both cases carefully.", tone: "neutral" },
      { t: "The theory {W}s complex ideas into simple, testable models.", tone: "formal" },
      { t: "CET-4 often tests whether students can {W} the main idea.", tone: "neutral" },
      { t: "The research paper {W}s several important social trends.", tone: "formal" },
      { t: "This formula {W}s the relationship between force and motion.", tone: "formal" },
      { t: "It is essential to {W} the data before drawing conclusions.", tone: "formal" },
      { t: "The analysis {W}s three distinct patterns in the results.", tone: "formal" },
      { t: "Students must learn to {W} credible sources from unreliable ones.", tone: "neutral" },
      { t: "The curriculum {W}s both theoretical and practical knowledge.", tone: "formal" },
      { t: "This chapter {W}s the key concepts from the previous section.", tone: "formal" },
      { t: "The professor asked us to {W} the text closely for hidden meaning.", tone: "neutral" },
    ],
  },
  noun: {
    daily: [
      { t: "That's a really nice {W} you've got there!", tone: "neutral" },
      { t: "I left my {W} at home — what a terrible day!", tone: "humorous" },
      { t: "There's a {W} on the table that needs your attention.", tone: "neutral" },
      { t: "The {W} of this place is really impressive.", tone: "neutral" },
      { t: "We had a great {W} at the new restaurant downtown.", tone: "neutral" },
      { t: "She has a natural {W} for solving difficult problems.", tone: "neutral" },
      { t: "The {W} was so boring I almost fell asleep!", tone: "humorous" },
      { t: "Can you give me a {W} about the schedule?", tone: "neutral" },
      { t: "My brother takes {W} in everything he does.", tone: "neutral" },
      { t: "The {W} of this book is what first caught my eye.", tone: "neutral" },
      { t: "I need to buy a new {W} for my apartment.", tone: "neutral" },
      { t: "That was a complete {W} of time and money.", tone: "humorous" },
      { t: "She showed great {W} in handling the difficult customer.", tone: "neutral" },
      { t: "The {W} we had at the party was unforgettable.", tone: "neutral" },
      { t: "What's the {W} of that word in Chinese?", tone: "neutral" },
    ],
    news: [
      { t: "The {W} has become a major topic of public debate.", tone: "formal" },
      { t: "A new {W} was introduced to address the growing concern.", tone: "formal" },
      { t: "The {W} of the crisis was widely reported by the media.", tone: "formal" },
      { t: "Officials announced a significant {W} in the investigation.", tone: "formal" },
      { t: "The {W} between the two nations has strengthened over time.", tone: "formal" },
      { t: "The economic {W} shows signs of steady recovery.", tone: "formal" },
      { t: "The {W} of the agreement marks a historic achievement.", tone: "formal" },
      { t: "The report highlights the {W} of healthcare reform.", tone: "formal" },
      { t: "The {W} will take effect at the beginning of next month.", tone: "formal" },
      { t: "A summit on the {W} is scheduled for later this year.", tone: "formal" },
      { t: "The {W} reflects the changing demographics of the region.", tone: "formal" },
      { t: "International {W} has been crucial for disaster relief.", tone: "formal" },
      { t: "The {W} in the region has drawn global attention.", tone: "formal" },
      { t: "The {W} of the proposal received widespread support.", tone: "formal" },
      { t: "The government invested heavily in public {W}.", tone: "formal" },
    ],
    academic: [
      { t: "The {W} of this concept is central to the theory.", tone: "formal" },
      { t: "The research explores the {W} between language and culture.", tone: "formal" },
      { t: "This {W} appears frequently in CET-4 reading passages.", tone: "neutral" },
      { t: "A solid {W} of grammar is essential for writing.", tone: "neutral" },
      { t: "The study provides a detailed {W} of the phenomenon.", tone: "formal" },
      { t: "The {W} of the experiment was measured precisely.", tone: "formal" },
      { t: "This theory offers a useful {W} for analyzing data.", tone: "formal" },
      { t: "The {W} serves as a foundation for further research.", tone: "formal" },
      { t: "The course covers the basic {W} of marketing strategy.", tone: "formal" },
      { t: "The {W} demonstrated a clear cause-and-effect relationship.", tone: "formal" },
      { t: "Critical thinking is a key {W} of higher education.", tone: "neutral" },
      { t: "The {W} of this argument lies in its logical structure.", tone: "formal" },
      { t: "The article examines the {W} in different cultural contexts.", tone: "formal" },
      { t: "A strong {W} in vocabulary helps with reading comprehension.", tone: "neutral" },
      { t: "The {W} was tested across multiple sample groups.", tone: "formal" },
    ],
  },
  adj: {
    daily: [
      { t: "This place looks really {W} — I love the design!", tone: "neutral" },
      { t: "The weather today is so {W} that I want to stay home.", tone: "neutral" },
      { t: "She's such a {W} person — everyone likes her.", tone: "neutral" },
      { t: "This food tastes {W} — did you add a secret ingredient?", tone: "humorous" },
      { t: "I feel really {W} after that long walk.", tone: "neutral" },
      { t: "The movie was so {W} I watched it three times!", tone: "humorous" },
      { t: "My new apartment is more {W} than the old one.", tone: "neutral" },
      { t: "That's a very {W} thing to say in this situation.", tone: "neutral" },
      { t: "He's not just smart — he's genuinely {W}.", tone: "neutral" },
      { t: "The room feels {W} with the new furniture.", tone: "neutral" },
      { t: "This is the most {W} gift I've ever received!", tone: "neutral" },
      { t: "I find this book incredibly {W} and thought-provoking.", tone: "neutral" },
      { t: "The puppy is so {W} that everyone wants to adopt it.", tone: "neutral" },
      { t: "Her voice sounds {W} in this recording.", tone: "neutral" },
      { t: "This dress is {W} but also very expensive.", tone: "neutral" },
    ],
    news: [
      { t: "The economic outlook remains {W} despite recent challenges.", tone: "formal" },
      { t: "The government has taken {W} measures to address the issue.", tone: "formal" },
      { t: "This region is known for its {W} natural resources.", tone: "formal" },
      { t: "The new policy aims to create a more {W} society.", tone: "formal" },
      { t: "The situation has become increasingly {W} in recent months.", tone: "formal" },
      { t: "The report describes the conditions as {W} and unacceptable.", tone: "formal" },
      { t: "A {W} agreement was reached after weeks of negotiation.", tone: "formal" },
      { t: "The survey reveals a {W} trend among young voters.", tone: "formal" },
      { t: "The {W} impact of climate change is already visible.", tone: "formal" },
      { t: "The committee deemed the proposal {W} for further review.", tone: "formal" },
      { t: "The {W} growth of the industry has attracted global investors.", tone: "formal" },
      { t: "The city has made {W} progress in reducing pollution.", tone: "formal" },
      { t: "The technology offers a {W} advantage over traditional methods.", tone: "formal" },
      { t: "The {W} conditions prompted officials to issue a warning.", tone: "formal" },
      { t: "The outcome of the trial was {W} to all observers.", tone: "formal" },
    ],
    academic: [
      { t: "This is a {W} concept that students must understand.", tone: "neutral" },
      { t: "The data shows a {W} difference between the two groups.", tone: "formal" },
      { t: "A {W} analysis of the text reveals multiple layers of meaning.", tone: "formal" },
      { t: "The study provides {W} evidence to support the hypothesis.", tone: "formal" },
      { t: "It is {W} to note that correlation does not imply causation.", tone: "neutral" },
      { t: "This theory remains {W} in modern academic discourse.", tone: "formal" },
      { t: "The research method must be {W} to ensure valid results.", tone: "formal" },
      { t: "Students need to be {W} of logical fallacies in arguments.", tone: "neutral" },
      { t: "The assignment requires a {W} understanding of the topic.", tone: "neutral" },
      { t: "The {W} nature of the problem demands interdisciplinary study.", tone: "formal" },
      { t: "The results were {W} across all test groups.", tone: "formal" },
      { t: "The relationship between variables is not immediately {W}.", tone: "formal" },
      { t: "A {W} approach is needed to solve complex equations.", tone: "formal" },
      { t: "This textbook is widely considered {W} for exam preparation.", tone: "neutral" },
      { t: "The essay should include {W} examples to illustrate each point.", tone: "neutral" },
    ],
  },
  adv: {
    daily: [
      { t: "She spoke {W} during the entire presentation.", tone: "neutral" },
      { t: "Please drive {W} — the roads are slippery today.", tone: "neutral" },
      { t: "He {W} finished his homework before dinner.", tone: "neutral" },
      { t: "They {W} agreed to help us with the project.", tone: "neutral" },
      { t: "I {W} forgot about our appointment — I'm so sorry!", tone: "humorous" },
      { t: "She smiled {W} as she read the good news.", tone: "neutral" },
      { t: "The waiter {W} brought us our orders.", tone: "neutral" },
      { t: "He {W} refused to answer any more questions.", tone: "neutral" },
      { t: "The kids played {W} all afternoon in the park.", tone: "neutral" },
      { t: "I can {W} hear you — please speak up!", tone: "humorous" },
      { t: "The package arrived {W} this morning.", tone: "neutral" },
      { t: "She {W} explained the problem to the new student.", tone: "neutral" },
      { t: "They {W} enjoy spending weekends at the beach.", tone: "neutral" },
      { t: "He {W} answered every question correctly.", tone: "neutral" },
      { t: "The plan worked {W} better than we expected.", tone: "neutral" },
    ],
    news: [
      { t: "The economy is growing {W} this fiscal year.", tone: "formal" },
      { t: "Officials {W} denied any involvement in the scandal.", tone: "formal" },
      { t: "The new policy was {W} implemented across all sectors.", tone: "formal" },
      { t: "The situation has {W} improved since the intervention.", tone: "formal" },
      { t: "The committee {W} approved the revised budget proposal.", tone: "formal" },
      { t: "The company's profits have {W} increased this quarter.", tone: "formal" },
      { t: "The ambassador {W} stated that negotiations are ongoing.", tone: "formal" },
      { t: "The region has {W} recovered from the natural disaster.", tone: "formal" },
      { t: "The technology is {W} adopted by leading institutions.", tone: "formal" },
      { t: "The reforms were {W} welcomed by the public.", tone: "formal" },
      { t: "The two countries {W} agreed to strengthen cooperation.", tone: "formal" },
      { t: "The proposal was {W} rejected by the board.", tone: "formal" },
      { t: "The population has {W} grown over the past decade.", tone: "formal" },
      { t: "The policy was {W} criticized by opposition parties.", tone: "formal" },
      { t: "The project was {W} completed ahead of schedule.", tone: "formal" },
    ],
    academic: [
      { t: "The data {W} supports the proposed hypothesis.", tone: "formal" },
      { t: "The theory {W} explains a wide range of phenomena.", tone: "formal" },
      { t: "The results {W} differ from previous studies in this field.", tone: "formal" },
      { t: "The concept is {W} defined in the textbook.", tone: "neutral" },
      { t: "The variable {W} affects the outcome of the experiment.", tone: "formal" },
      { t: "The correlation is {W} significant at the 0.05 level.", tone: "formal" },
      { t: "The methodology is {W} described in the appendix.", tone: "formal" },
      { t: "The findings are {W} consistent with earlier research.", tone: "formal" },
      { t: "The distribution {W} follows a normal curve.", tone: "formal" },
      { t: "The argument {W} relies on a flawed assumption.", tone: "formal" },
      { t: "The phenomenon {W} occurs in multiple contexts.", tone: "formal" },
      { t: "The sample was {W} selected to represent the population.", tone: "neutral" },
      { t: "The function {W} increases as x approaches infinity.", tone: "formal" },
      { t: "The author {W} argues that further research is needed.", tone: "formal" },
      { t: "The variance is {W} distributed among the subgroups.", tone: "formal" },
    ],
  },
  other: {
    daily: [
      { t: "That's exactly {W} what I was thinking!", tone: "neutral" },
      { t: "This is {W} something we should discuss later.", tone: "neutral" },
      { t: "The situation is {W} different from what we expected.", tone: "neutral" },
      { t: "I'll call you {W} I arrive at the station.", tone: "neutral" },
      { t: "She acted {W} a true professional during the crisis.", tone: "neutral" },
      { t: "This is {W} the best pizza in town!", tone: "humorous" },
      { t: "We need to finish this {W} we leave.", tone: "neutral" },
      { t: "It's {W} a small world — I ran into my old classmate!", tone: "humorous" },
      { t: "The store is open {W} the holidays.", tone: "neutral" },
      { t: "He did it {W} knowing the consequences.", tone: "neutral" },
    ],
    news: [
      { t: "The decision was made {W} the circumstances.", tone: "formal" },
      { t: "The policy applies {W} to all member states.", tone: "formal" },
      { t: "The investigation continues {W} the lack of evidence.", tone: "formal" },
      { t: "The agreement will remain in effect {W} further notice.", tone: "formal" },
      { t: "The country has been {W} a state of emergency.", tone: "formal" },
      { t: "The project was delayed {W} budget constraints.", tone: "formal" },
      { t: "The treaty was signed {W} the two neighboring countries.", tone: "formal" },
      { t: "The program operates {W} the supervision of experts.", tone: "formal" },
      { t: "The funds were allocated {W} the new education plan.", tone: "formal" },
      { t: "The event took place {W} schedule despite the challenges.", tone: "formal" },
    ],
    academic: [
      { t: "This phenomenon is observed {W} in different cultures.", tone: "formal" },
      { t: "The formula holds true {W} certain conditions.", tone: "formal" },
      { t: "The analysis is conducted {W} the framework of critical theory.", tone: "formal" },
      { t: "The results vary {W} the population being studied.", tone: "formal" },
      { t: "The model is defined {W} a set of linear equations.", tone: "formal" },
      { t: "The concept applies {W} various academic disciplines.", tone: "formal" },
      { t: "The behavior is studied {W} its social context.", tone: "formal" },
      { t: "The data was collected {W} standardized procedures.", tone: "formal" },
      { t: "The theory evolved {W} feedback from the scientific community.", tone: "formal" },
      { t: "The approach is used {W} the study of complex systems.", tone: "formal" },
    ],
  },
}

function getPosCategory(pos) {
  if (!pos) return 'other'
  const p = pos.toLowerCase()
  if (p.startsWith('v')) return 'verb'
  if (p.startsWith('n')) return 'noun'
  if (p.startsWith('adj')) return 'adj'
  if (p.startsWith('adv')) return 'adv'
  return 'other'
}

const transPatterns = {
  daily: "这个单词在日常对话中表示「{D}」。",
  news: "在新闻报道中，「{D}」是一个常见术语。",
  academic: "在考试语境中，理解「{D}」的概念非常重要。",
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function isTooSimilar(a, b, threshold = 0.5) {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return true
  return levenshtein(a, b) / maxLen < threshold
}

const scenarioLabels = {
  daily: '日常对话',
  news: '新闻评论',
  academic: '学术考试',
}

// ── Word ending-based conjugation helper ──
function conjugate(word, pattern) {
  let w = word.toLowerCase()
  // Handle {W}s (third person)
  pattern = pattern.replace(/\{W\}s/g, () => {
    if (/[sxz]$|sh$|ch$/.test(w)) return w + 'es'
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies'
    return w + 's'
  })
  // Handle {W}ed (past tense)
  pattern = pattern.replace(/\{W\}ed/g, () => {
    if (/e$/.test(w)) return w + 'd'
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied'
    return w + 'ed'
  })
  // Handle remaining {W}
  pattern = pattern.replace(/\{W\}/g, w)
  return pattern
}

function generateDiverseExamples(wordData) {
  return wordData.map(w => {
    const category = getPosCategory(w.pos)
    const catPatterns = patterns[category] || patterns.other
    const wordLower = w.word.toLowerCase()

    const defSnippet = w.definition
      ? w.definition.length > 10
        ? w.definition.slice(0, 8) + '...'
        : w.definition
      : w.word

    const examples = []
    const usedTexts = []

    const scenarios = ['daily', 'news', 'academic']
    for (const scenario of scenarios) {
      const scenarioPatterns = catPatterns[scenario] || catPatterns.daily
      const shuffled = [...scenarioPatterns].sort(() => Math.random() - 0.5)
      let picked = false

      for (const pattern of shuffled) {
        const text = conjugate(wordLower, pattern.t)

        // Fix verb conjugation: paste tense for news
        // Simple heuristic: if the pattern contains "ed" and word ends with e, just add d
        // Actually the pattern templates already handle this with {W}ed
        // but {W}ed is already substituted with word + "ed" above

        const tooSim = usedTexts.some(ut => isTooSimilar(ut, text))
        if (tooSim && usedTexts.length > 0) continue

        const trans = transPatterns[scenario].replace('{D}', defSnippet)

        let freq
        if (scenario === 'academic') freq = 5
        else if (scenario === 'news') freq = 3
        else freq = 2

        examples.push({ text, translation: trans, tone: pattern.tone, scenario: scenarioLabels[scenario], frequency: freq })
        usedTexts.push(text)
        picked = true
        break
      }

      // Fallback if no pattern worked
      if (!picked) {
        const text = `The concept of ${wordLower} is important in ${scenario} contexts.`
        const trans = transPatterns[scenario].replace('{D}', defSnippet)
        examples.push({ text, translation: trans, tone: 'neutral', scenario: scenarioLabels[scenario], frequency: scenario === 'academic' ? 5 : 3 })
        usedTexts.push(text)
      }
    }

    examples.sort((a, b) => b.frequency - a.frequency)

    const { example, exampleTranslation, ...rest } = w
    return { ...rest, examples }
  })
}

const filePath = path.join(__dirname, '..', 'src', 'data', 'words.js')
const content = fs.readFileSync(filePath, 'utf8')
const match = content.match(/\[([\s\S]*)\]/)
if (!match) {
  console.error('Could not parse words.js')
  process.exit(1)
}

const wordData = JSON.parse(match[0])
const updated = generateDiverseExamples(wordData)

const outPath = path.join(__dirname, '..', 'src', 'data', 'words.js')
const code = `const words = ${JSON.stringify(updated)}
export default words`
fs.writeFileSync(outPath, code, 'utf8')
console.log('Done! Wrote', updated.length, 'words to', outPath)
