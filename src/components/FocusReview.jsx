import { useState, useEffect, useMemo } from 'react'
import { Star, Volume2, AlertTriangle, TrendingDown, BookOpen, ArrowLeft, Check, X, RotateCcw } from 'lucide-react'
import wordsData from '../data/words'
import {
  getFocusWords, getStarredWords, getDifficultWords, getWeakWords,
  toggleStarred, isStarred, loadAllProgress,
  calculateSrs, saveWordProgress, getWordProgress, getDefaultSrs,
} from '../utils/srs'
import { playSuccess, playFail, playFlip, playStarOn, playStarOff } from '../utils/audio'
import useTTS from '../hooks/useTTS'
import BackButton from './BackButton'
import { LOADING, CORRECT, WRONG, DONE, EMOJI_CORRECT, EMOJI_WRONG, PROGRESS_PHRASES, pick } from '../utils/humorConstants'

const FILTERS = [
  { key: 'all', label: '全部重点词', icon: AlertTriangle },
  { key: 'starred', label: '收藏', icon: Star },
  { key: 'difficult', label: '高错误', icon: TrendingDown },
  { key: 'weak', label: '薄弱词', icon: BookOpen },
]

export default function FocusReview() {
  const [filter, setFilter] = useState('starred')
  const [words, setWords] = useState([])
  const [reviewMode, setReviewMode] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [flash, setFlash] = useState(null)
  const [feedbackClass, setFeedbackClass] = useState('')
  const [starred, setStarred] = useState(new Set())
  const [starAnimId, setStarAnimId] = useState(null)
  const [isDone, setIsDone] = useState(false)
  const [humorMsg, setHumorMsg] = useState(null)
  const [humorEmoji, setHumorEmoji] = useState(null)
  const [loadingCopy, setLoadingCopy] = useState('加载中...')
  const [progressPhrase] = useState(() => pick(PROGRESS_PHRASES))
  const { speaking, autoplayBlocked, toggle: speakWord, speak, preload } = useTTS()

  useEffect(() => {
    loadWords()
    loadStarredState()
    setLoadingCopy(pick(LOADING))
    const interval = setInterval(() => setLoadingCopy(pick(LOADING)), 3000)
    return () => clearInterval(interval)
  }, [filter])

  useEffect(() => {
    if (currentWord) {
      speak(currentWord.word, { isAutoplay: true })
      const nextIds = [currentIndex + 1, currentIndex + 2]
      nextIds.forEach(idx => {
        if (idx < words.length) {
          setTimeout(() => preload(), 200 + (idx - currentIndex) * 150)
        }
      })
    }
  }, [currentWord?.id])

  function loadWords() {
    let result = []
    switch (filter) {
      case 'all': result = getFocusWords(wordsData); break
      case 'starred': result = getStarredWords(wordsData); break
      case 'difficult': result = getDifficultWords(wordsData, 2); break
      case 'weak': result = getWeakWords(wordsData); break
    }
    setWords(result)
    setCurrentIndex(0)
    setFlipped(false)
    setIsDone(false)
  }

  function loadStarredState() {
    const set = new Set()
    const starredIds = JSON.parse(localStorage.getItem('cet4-starred-words') || '[]')
    starredIds.forEach(id => set.add(id))
    setStarred(new Set(set))
  }

  const currentWord = reviewMode ? words[currentIndex] : null

  function handleToggleStar(wordId, e) {
    if (e) e.stopPropagation()
    const wasStarred = starred.has(wordId)
    toggleStarred(wordId)
    const next = new Set(starred)
    if (wasStarred) next.delete(wordId)
    else next.add(wordId)
    setStarred(next)
    ;(wasStarred ? playStarOff : playStarOn)()
    if (!reviewMode) loadWords()
  }

  function enterReview() {
    if (words.length === 0) return
    setReviewMode(true)
    setCurrentIndex(0)
    setFlipped(false)
    setIsDone(false)
  }

  function exitReview() {
    setReviewMode(false)
    loadWords()
  }

  function handleResponse(isKnown) {
    if (!currentWord || animating) return
    setAnimating(true)
    setFlash(isKnown ? 'known' : 'unknown')
    setFeedbackClass(isKnown ? 'bounce-correct' : 'shake-wrong')
    if (isKnown) { playSuccess(); setHumorMsg(pick(CORRECT)); setHumorEmoji(pick(EMOJI_CORRECT)) }
    else { playFail(); setHumorMsg(pick(WRONG)); setHumorEmoji(pick(EMOJI_WRONG)) }
    setTimeout(() => { setHumorMsg(null); setHumorEmoji(null) }, 2000)

    const prevProgress = getWordProgress(currentWord.id)
    const newSrs = calculateSrs(prevProgress, isKnown)
    saveWordProgress(currentWord.id, newSrs)

    setTimeout(() => {
      setFlash(null)
      setFeedbackClass('')
      setFlipped(false)
      if (currentIndex < words.length - 1) {
        setCurrentIndex(i => i + 1)
      } else {
        setIsDone(true)
      }
      setAnimating(false)
    }, 450)
  }

  const filterTabs = FILTERS.map(f => {
    const Icon = f.icon
    const isActive = filter === f.key
    return (
      <button
        key={f.key}
        onClick={() => setFilter(f.key)}
        className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 btn-press min-h-[36px] ${
          isActive
            ? 'bg-primary-500 text-white shadow-soft'
            : 'text-surface-500 hover:text-surface-700 hover:bg-surface-100'
        }`}
      >
        <Icon className="w-3.5 h-3.5" />
        {f.label}
      </button>
    )
  })

  // ── Review Mode ──
  if (reviewMode) {
    // Custom back button for review mode (returns to list)
    const reviewBack = (
      <button
        onClick={exitReview}
        className="fixed top-4 left-4 z-40 flex items-center gap-1.5 px-3.5 py-2.5 bg-white/80 backdrop-blur-md border border-surface-100/80 rounded-xl text-xs font-medium text-surface-500 hover:text-surface-800 hover:border-surface-200 shadow-soft hover:shadow-md transition-all duration-200 active:scale-95 min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">返回列表</span>
      </button>
    )

    if (!currentWord) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
            <span className="text-surface-400 text-sm animate-pulse italic">{loadingCopy}</span>
          </div>
        </div>
      )
    }

    if (isDone) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-white rounded-2xl shadow-soft-lg p-8 sm:p-10 text-center max-w-md w-full animate-[scale-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-surface-800 mb-2 font-display">{pick(DONE)}</h2>
            <p className="text-surface-400 mb-6">共复习了 {words.length} 个重点词</p>
            {reviewBack}
          </div>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center px-4 py-6 sm:py-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              {reviewBack}
              <span className="text-xs font-medium text-surface-400">
                {progressPhrase.replace('{remain}', words.length - currentIndex - 1).replace('{done}', Math.round((currentIndex / words.length) * 100))}
              </span>
            </div>
            <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden mt-2">
              <div
                className="h-full bg-gradient-to-r from-rose-300 via-rose-500 to-rose-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${(currentIndex / words.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Card */}
          <div
            className={`card-flip h-72 sm:h-80 mb-6 cursor-pointer select-none ${
              flash === 'known' ? 'flash-known' : flash === 'unknown' ? 'flash-unknown' : ''
            } ${feedbackClass}`}
            onClick={() => {
              if (animating) return
              setFlipped(prev => { const next = !prev; if (next) playFlip(); return next })
            }}
          >
            <div className={`card-flip-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}>
              {/* Front */}
              <div className="card-face absolute inset-0 bg-white rounded-2xl shadow-soft border border-surface-100 p-6 sm:p-8 flex flex-col items-center justify-center">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-400 rounded-t-2xl" />
                <button
                  onClick={(e) => { e.stopPropagation(); speakWord(currentWord.word) }}
                  className={`absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 ${
                    speaking ? 'text-primary-500 bg-primary-50' : autoplayBlocked ? 'text-amber-500 bg-amber-50 animate-pulse' : 'text-surface-300 hover:text-primary-500 hover:bg-primary-50'
                  }`}
                  title={autoplayBlocked ? '浏览器已拦截自动播放，点击手动播放' : ''}
                >
                  {speaking ? (
                    <svg className="w-5 h-5 speaker-wave" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="10" width="3" height="4" rx="1" />
                      <rect x="10.5" y="8" width="3" height="8" rx="1" />
                      <rect x="15" y="6" width="3" height="12" rx="1" />
                    </svg>
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <h2 className="text-4xl sm:text-5xl font-bold text-surface-800 mb-3 font-display tracking-tight">
                  {currentWord.word}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-50 text-surface-400 rounded-full text-sm border border-surface-100">
                  {currentWord.phonetic}
                </span>
                <p className="text-xs text-surface-300 mt-6">点击卡片翻转查看释义</p>
              </div>

              {/* Back */}
              <div className="card-face card-back absolute inset-0 bg-white rounded-2xl shadow-soft border border-surface-100 p-6 sm:p-8 flex flex-col justify-center">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-red-500 to-red-400 rounded-t-2xl" />
                {/* Star button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggleStar(currentWord.id, e); setStarAnimId(currentWord.id) }}
                  className={`absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 star-btn ${
                    starred.has(currentWord.id)
                      ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                      : 'text-surface-300 hover:text-yellow-500 hover:bg-yellow-50'
                  }`}
                >
                  <Star className={`w-5 h-5 ${starred.has(currentWord.id) ? 'fill-yellow-500' : ''} ${starAnimId === currentWord.id ? 'star-pop' : ''}`} onAnimationEnd={() => setStarAnimId(null)} />
                </button>
                <div className="text-center mb-5">
                  <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full font-medium mb-4 border border-red-100">
                    {currentWord.pos}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-surface-800 mb-3 leading-snug">{currentWord.definition}</h3>
                </div>
                <div className="bg-gradient-to-br from-surface-50 to-surface-100/30 rounded-xl p-4 text-left border border-surface-100">
                  <p className="text-surface-600 text-sm mb-1.5 leading-relaxed italic">"{currentWord.example}"</p>
                  <p className="text-surface-400 text-xs">{currentWord.exampleTranslation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Humor feedback */}
          {humorMsg && (
            <div className="flex items-center justify-center gap-2 mb-4 animate-[fade-down_0.3s_ease-out]">
              {humorEmoji && <span className="text-xl animate-[scale-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">{humorEmoji}</span>}
              <span className="text-sm text-primary-500 font-medium italic">{humorMsg}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 sm:gap-4">
            <button
              onClick={() => handleResponse(false)}
              disabled={animating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-white border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-300 btn-press font-medium disabled:opacity-50 transition-all duration-200 min-h-[52px]"
            >
              <X className="w-5 h-5" />
              <span className="hidden xs:inline">不认识</span>
            </button>
            <div className="flex items-center text-surface-200 text-xs font-medium">或</div>
            <button
              onClick={() => handleResponse(true)}
              disabled={animating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 btn-press font-medium disabled:opacity-50 transition-all duration-200 min-h-[52px]"
            >
              <Check className="w-5 h-5" />
              <span className="hidden xs:inline">认识</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── List Mode ──
  return (
    <div className="px-4 py-6 sm:py-8 max-w-lg mx-auto">
      <BackButton />
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-surface-800 font-display">重点词复习</h2>
        <p className="text-xs text-surface-400 mt-0.5">集中攻克易错词和收藏词</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 mb-4">
        {filterTabs}
      </div>

      {/* Word count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-surface-500">
          共 <span className="font-semibold text-surface-700">{words.length}</span> 个重点词
        </p>
        {words.length > 0 && (
          <button
            onClick={enterReview}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600 btn-press font-medium transition-all duration-200 shadow-soft"
          >
            <BookOpen className="w-3.5 h-3.5" />
            开始复习
          </button>
        )}
      </div>

      {/* Word list */}
      {words.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-surface-400">
          <AlertTriangle className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">暂无重点词</p>
          <p className="text-xs text-surface-300 mt-1">完成一些学习任务后，这里会出现需要重点复习的单词</p>
        </div>
      ) : (
        <div className="space-y-1">
          {words.map((w, i) => (
            <div
              key={w.id}
              className="flex items-center px-4 py-3 bg-white rounded-xl border border-surface-100 hover:border-primary-200 hover:shadow-sm transition-all duration-200 group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-surface-800 truncate max-w-[110px] xs:max-w-[160px]">{w.word}</span>
                  <span className="text-xs text-surface-400 shrink-0 hidden sm:inline">{w.phonetic}</span>
                  <span className="text-[11px] px-1.5 py-0.5 bg-red-50 text-red-600 rounded leading-none font-medium border border-red-100">{w.pos}</span>
                </div>
                <div className="text-sm text-surface-500 truncate mt-0.5">{w.definition}</div>
              </div>
              <button
                onClick={(e) => { handleToggleStar(w.id, e); setStarAnimId(w.id) }}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 star-btn ${
                  starred.has(w.id)
                    ? 'text-yellow-500 hover:text-yellow-600'
                    : 'text-surface-300 hover:text-yellow-500 opacity-0 group-hover:opacity-100 focus:opacity-100'
                }`}
              >
                <Star className={`w-4 h-4 ${starred.has(w.id) ? 'fill-yellow-500' : ''} ${starAnimId === w.id ? 'star-pop' : ''}`} onAnimationEnd={() => setStarAnimId(null)} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
