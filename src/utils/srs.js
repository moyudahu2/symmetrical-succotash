const STORAGE_KEY = 'cet4-word-progress'
const STREAK_KEY = 'cet4-study-dates'
const STARRED_KEY = 'cet4-starred-words'

const defaultSrs = {
  easeFactor: 2.5,
  interval: 0,
  repetitions: 0,
  nextReviewDate: null,
  status: 'new',
  correctCount: 0,
  incorrectCount: 0,
  consecutiveIncorrect: 0,
  lastResult: null,
}

// SM-2 simplified spaced repetition algorithm
export function calculateSrs(wordProgress, isKnown) {
  const srs = { ...wordProgress }

  if (isKnown) {
    srs.repetitions += 1
    srs.consecutiveIncorrect = 0
    srs.lastResult = true

    if (srs.repetitions === 1) {
      srs.interval = 1
    } else if (srs.repetitions === 2) {
      srs.interval = 3
    } else {
      srs.interval = Math.round(srs.interval * srs.easeFactor)
    }

    srs.easeFactor = Math.max(1.3, srs.easeFactor + 0.1)
    srs.correctCount = (srs.correctCount || 0) + 1
  } else {
    srs.repetitions = 0
    srs.interval = 1
    srs.consecutiveIncorrect = (srs.consecutiveIncorrect || 0) + 1
    srs.lastResult = false
    srs.easeFactor = Math.max(1.3, srs.easeFactor - 0.2)
    srs.incorrectCount = (srs.incorrectCount || 0) + 1
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + srs.interval)
  srs.nextReviewDate = nextDate.toISOString().split('T')[0]

  const total = (srs.correctCount || 0) + (srs.incorrectCount || 0)
  if (total >= 5 && (srs.correctCount || 0) / total >= 0.8) {
    srs.status = 'mastered'
  } else if (srs.repetitions > 0) {
    srs.status = 'reviewing'
  } else {
    srs.status = 'learning'
  }

  return srs
}

export function loadAllProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveWordProgress(wordId, srsData) {
  const all = loadAllProgress()
  all[wordId] = srsData
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  recordStudyDate()
}

export function getWordProgress(wordId) {
  const all = loadAllProgress()
  return all[wordId] || { ...defaultSrs }
}

export function getDefaultSrs() {
  return { ...defaultSrs }
}

export function recordStudyDate() {
  const today = new Date().toISOString().split('T')[0]
  const dates = loadStudyDates()
  if (!dates.includes(today)) {
    dates.push(today)
    localStorage.setItem(STREAK_KEY, JSON.stringify(dates))
  }
}

export function loadStudyDates() {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function calculateStreak() {
  const dates = loadStudyDates().sort().reverse()
  if (dates.length === 0) return 0

  let streak = 1
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (dates[0] !== today && dates[0] !== yesterday) return 0

  for (let i = 1; i < dates.length; i++) {
    const curr = new Date(dates[i - 1])
    const prev = new Date(dates[i])
    const diff = (curr - prev) / 86400000
    if (diff === 1) {
      streak++
    } else {
      break
    }
  }
  return streak
}

export function getMasteredCount() {
  const all = loadAllProgress()
  return Object.values(all).filter(p => p.status === 'mastered').length
}

export function getDueWords(wordList) {
  const today = new Date().toISOString().split('T')[0]
  const all = loadAllProgress()

  return wordList.filter(w => {
    const prog = all[w.id]
    if (!prog) return true
    if (prog.status === 'mastered') return false
    return !prog.nextReviewDate || prog.nextReviewDate <= today
  })
}

export function getTodayReviewCount(wordList) {
  const today = new Date().toISOString().split('T')[0]
  const all = loadAllProgress()
  return wordList.filter(w => {
    const prog = all[w.id]
    if (!prog) return false
    if (prog.status === 'mastered') return false
    return prog.nextReviewDate === today
  }).length
}

export function getOverallPercent(wordList) {
  const total = wordList.length
  const mastered = getMasteredCount()
  return total > 0 ? Math.round((mastered / total) * 100) : 0
}

// ════════════════════════════════════════════
// Key Word / Focus Review System
// ════════════════════════════════════════════

function loadStarredIds() {
  try {
    const raw = localStorage.getItem(STARRED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStarredIds(ids) {
  localStorage.setItem(STARRED_KEY, JSON.stringify(ids))
}

export function isStarred(wordId) {
  return loadStarredIds().includes(wordId)
}

export function toggleStarred(wordId) {
  const ids = loadStarredIds()
  const idx = ids.indexOf(wordId)
  if (idx >= 0) {
    ids.splice(idx, 1)
  } else {
    ids.push(wordId)
  }
  saveStarredIds(ids)
  return !(idx >= 0)
}

/** Words marked as starred by the user */
export function getStarredWords(wordList) {
  const starred = loadStarredIds()
  return wordList.filter(w => starred.includes(w.id))
}

/** Words with high error count or very low ease factor (struggled words) */
export function getDifficultWords(wordList, threshold) {
  const all = loadAllProgress()
  const t = threshold || 2
  return wordList.filter(w => {
    const p = all[w.id]
    if (!p) return false
    if (p.status === 'mastered') return false
    return (p.incorrectCount || 0) >= t || (p.easeFactor || 2.5) <= 1.5
  })
}

/** Words where the last answer was wrong */
export function getWeakWords(wordList) {
  const all = loadAllProgress()
  return wordList.filter(w => {
    const p = all[w.id]
    if (!p) return false
    return p.lastResult === false
  })
}

/** Combined focus word list: union of starred, difficult, and weak */
export function getFocusWords(wordList) {
  const all = loadAllProgress()
  const starred = loadStarredIds()
  const threshold = 2
  return wordList.filter(w => {
    const p = all[w.id]
    const isStarredWord = starred.includes(w.id)
    if (isStarredWord) return true
    if (!p || p.status === 'mastered') return false
    if ((p.incorrectCount || 0) >= threshold || (p.easeFactor || 2.5) <= 1.5) return true
    if (p.lastResult === false) return true
    return false
  })
}

export function getFocusWordCount(wordList) {
  return getFocusWords(wordList).length
}

export function getStarredCount() {
  return loadStarredIds().length
}

export function getDifficultCount(wordList) {
  const all = loadAllProgress()
  const threshold = 2
  return wordList.filter(w => {
    const p = all[w.id]
    if (!p || p.status === 'mastered') return false
    return (p.incorrectCount || 0) >= threshold || (p.easeFactor || 2.5) <= 1.5
  }).length
}

export function getWeakCount(wordList) {
  const all = loadAllProgress()
  return wordList.filter(w => {
    const p = all[w.id]
    if (!p) return false
    return p.lastResult === false
  }).length
}
