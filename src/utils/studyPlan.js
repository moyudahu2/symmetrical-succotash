const PLAN_KEY = 'cet4-study-plan'
const LOG_KEY = 'cet4-daily-log'

const defaultPlan = {
  dailyNewWords: 10,
  dailyReviewLimit: 30,
}

export function loadPlan() {
  try {
    const raw = localStorage.getItem(PLAN_KEY)
    return raw ? { ...defaultPlan, ...JSON.parse(raw) } : { ...defaultPlan }
  } catch {
    return { ...defaultPlan }
  }
}

export function savePlan(plan) {
  localStorage.setItem(PLAN_KEY, JSON.stringify(plan))
}

export function loadDailyLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveDailyLog(log) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log))
}

function today() {
  return new Date().toISOString().split('T')[0]
}

export function markWordStudied(wordId, progress) {
  const log = loadDailyLog()
  const day = today()
  if (!log[day]) log[day] = { newDone: 0, reviewDone: 0, wordIds: [] }
  if (log[day].wordIds.includes(wordId)) return
  log[day].wordIds.push(wordId)
  if (progress.status === 'new' || (!progress.nextReviewDate)) {
    log[day].newDone += 1
  } else {
    log[day].reviewDone += 1
  }
  saveDailyLog(log)
}

export function getTodayProgress() {
  const log = loadDailyLog()
  const day = today()
  return log[day] || { newDone: 0, reviewDone: 0, wordIds: [] }
}

export function getTodayQueue(wordList, progress) {
  const plan = loadPlan()
  const day = today()
  const log = loadDailyLog()
  const todayLog = log[day] || { newDone: 0, reviewDone: 0, wordIds: [] }

  // Boundary guard: if target <= completed, return empty (task is done)
  if (todayLog.reviewDone >= plan.dailyReviewLimit && todayLog.newDone >= plan.dailyNewWords) {
    return []
  }

  const isReviewWord = (w) => {
    const p = progress[w.id]
    if (!p) return false
    if (p.status === 'mastered') return false
    return !!p.nextReviewDate && p.nextReviewDate <= day
  }

  const isNewWord = (w) => {
    return !progress[w.id]
  }

  const alreadyDone = todayLog.wordIds || []

  const reviewWords = wordList
    .filter(w => isReviewWord(w) && !alreadyDone.includes(w.id))
    .sort(() => Math.random() - 0.5)

  const newWords = wordList
    .filter(w => isNewWord(w) && !alreadyDone.includes(w.id))
    .sort(() => Math.random() - 0.5)

  const remainingReviewSlots = Math.max(0, plan.dailyReviewLimit - todayLog.reviewDone)
  const remainingNewSlots = Math.max(0, plan.dailyNewWords - todayLog.newDone)

  const queue = [
    ...reviewWords.slice(0, remainingReviewSlots),
    ...newWords.slice(0, remainingNewSlots),
  ]

  return queue
}

export function getPlanSummary(wordList, progress) {
  const plan = loadPlan()
  const day = today()
  const log = loadDailyLog()
  const todayLog = log[day] || { newDone: 0, reviewDone: 0 }

  const isReviewWord = (w) => {
    const p = progress[w.id]
    if (!p) return false
    if (p.status === 'mastered') return false
    return !!p.nextReviewDate && p.nextReviewDate <= day
  }

  const isNewWord = (w) => !progress[w.id]

  const totalReviewDue = wordList.filter(w => isReviewWord(w)).length
  const totalNewAvailable = wordList.filter(w => isNewWord(w)).length

  return {
    plan,
    todayLog,
    totalReviewDue,
    totalNewAvailable,
    reviewRemaining: Math.max(0, plan.dailyReviewLimit - todayLog.reviewDone),
    newRemaining: Math.max(0, plan.dailyNewWords - todayLog.newDone),
    totalRemaining: Math.max(0, plan.dailyReviewLimit - todayLog.reviewDone) + Math.max(0, plan.dailyNewWords - todayLog.newDone),
  }
}
