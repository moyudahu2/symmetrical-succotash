import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, RotateCcw, Volume2, Star, ArrowRight, MessageCircle } from 'lucide-react'
import wordsData from '../data/words'
import { calculateSrs, saveWordProgress, getWordProgress, getDueWords, getDefaultSrs, loadAllProgress, isStarred, toggleStarred } from '../utils/srs'
import { playSuccess, playFail, playFlip, playStarOn, playStarOff } from '../utils/audio'
import useTTS from '../hooks/useTTS'
import { getTodayQueue, markWordStudied, getTodayProgress, loadPlan } from '../utils/studyPlan'
import BackButton from './BackButton'
import { LOADING, CORRECT, WRONG, DONE, LOADING_WORDS, pick } from '../utils/humorConstants'

const MAX_LOAD_RETRIES = 3

export default function Flashcard() {
  const [dueWords, setDueWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [flash, setFlash] = useState(null)
  const [feedbackClass, setFeedbackClass] = useState('')
  const [starred, setStarred] = useState(false)
  const [starAnim, setStarAnim] = useState(false)
  const [loadingError, setLoadingError] = useState(null)
  const [humorMsg, setHumorMsg] = useState(null)
  const [loadingCopy, setLoadingCopy] = useState(LOADING_WORDS)
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const loadAttempt = useRef(0)

  useEffect(() => {
    loadAttempt.current = 0
    let cancelled = false

    function loadQueue() {
      if (cancelled) return
      loadAttempt.current++
      if (loadAttempt.current > MAX_LOAD_RETRIES) {
        setLoadingError('加载失败，请刷新页面重试')
        return
      }

      const progress = loadAllProgress()
      const plan = loadPlan()
      const todayP = getTodayProgress()

      // Boundary check: if target <= completed, treat as done
      const reviewDone = todayP.reviewDone >= plan.dailyReviewLimit
      const newDone = todayP.newDone >= plan.dailyNewWords
      if (reviewDone && newDone) {
        setIsDone(true)
        return
      }

      const queue = getTodayQueue(wordsData, progress)
      if (queue.length === 0) {
        setIsDone(true)
        return
      }

      setDueWords(queue)
      setCurrentIndex(0)
      setFlipped(false)
      setIsDone(false)
    }

    loadQueue()
    setLoadingCopy(pick(LOADING))
    const loadingInterval = setInterval(() => setLoadingCopy(pick(LOADING)), 3000)
    return () => { cancelled = true; clearInterval(loadingInterval) }
  }, [])

  const currentWord = dueWords[currentIndex]

  useEffect(() => {
    if (currentWord) setStarred(isStarred(currentWord.id))
  }, [currentWord?.id])

  const handleResponse = useCallback((isKnown) => {
    if (!currentWord || animating) return
    setAnimating(true)
    setFlash(isKnown ? 'known' : 'unknown')
    setFeedbackClass(isKnown ? 'bounce-correct' : 'shake-wrong')
    if (isKnown) { playSuccess(); setHumorMsg(pick(CORRECT)) }
    else { playFail(); setHumorMsg(pick(WRONG)) }
    setTimeout(() => setHumorMsg(null), 1800)

    const prevProgress = getWordProgress(currentWord.id)
    const newSrs = calculateSrs(prevProgress, isKnown)
    saveWordProgress(currentWord.id, newSrs)
    markWordStudied(currentWord.id, prevProgress)

    setTimeout(() => {
      setFlash(null)
      setFeedbackClass('')
      setFlipped(false)
      if (currentIndex < dueWords.length - 1) {
        setCurrentIndex(i => i + 1)
      } else {
        setIsDone(true)
      }
      setAnimating(false)
    }, 450)
  }, [currentWord, currentIndex, dueWords.length, animating])


  const { speaking, autoplayBlocked, toggle: speakWord, speak, preload } = useTTS()

  useEffect(() => {
    if (currentWord) {
      speak(currentWord.word, { isAutoplay: true })
      // Preload next 2 words
      const nextIds = [currentIndex + 1, currentIndex + 2]
      nextIds.forEach(idx => {
        if (idx < dueWords.length) {
          setTimeout(() => preload(), 200 + (idx - currentIndex) * 150)
        }
      })
    }
  }, [currentWord?.id])

  if (loadingError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-soft-lg p-8 text-center max-w-md w-full">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h2 className="text-lg font-bold text-surface-800 mb-2">加载失败</h2>
          <p className="text-sm text-surface-400 mb-6">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 btn-press font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            刷新页面
          </button>
        </div>
      </div>
    )
  }

  if (isDone) {
    const plan = loadPlan()
    const todayP = getTodayProgress()
    const planAdjusted = (todayP.reviewDone > 0 || todayP.newDone > 0) &&
      (todayP.reviewDone < plan.dailyReviewLimit || todayP.newDone < plan.dailyNewWords)
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-soft-lg p-8 sm:p-10 text-center max-w-md w-full animate-[scale-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 bg-green-100 rounded-full animate-[confetti-pop_0.5s_cubic-bezier(0.34,1.56,0.64,1)_0.15s_both]" />
            <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
              <Check className="w-9 h-9 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-surface-800 mb-2 font-display">
            {planAdjusted ? '暂无更多任务' : pick(DONE)}
          </h2>
          <p className="text-surface-400 mb-6">
            {planAdjusted
              ? '当前计划量已低于已完成量，试试调整计划或重置进度'
              : '太棒了，今天的学习计划已完成。'}
          </p>
          <div className="bg-gradient-to-br from-surface-50 to-surface-100/50 rounded-xl p-5 mb-6 text-left border border-surface-100">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xl font-bold text-primary-500">{todayP.reviewDone}<span className="text-sm text-surface-400 font-normal">/{plan.dailyReviewLimit}</span></div>
                <div className="text-xs text-surface-400 mt-0.5">复习</div>
              </div>
              <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                <div className="text-xl font-bold text-accent-500">{todayP.newDone}<span className="text-sm text-surface-400 font-normal">/{plan.dailyNewWords}</span></div>
                <div className="text-xs text-surface-400 mt-0.5">新词</div>
              </div>
            </div>
          </div>
          {!planAdjusted && (
            <button
              onClick={() => navigate('/study/quiz')}
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 btn-press font-medium shadow-lg shadow-primary-200 transition-all duration-200"
            >
              <span>去测验</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

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

  return (
    <div className="flex flex-col items-center px-4 py-6 sm:py-10" ref={containerRef}>
      <BackButton />
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-xs font-medium text-surface-400 bg-surface-100 px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {dueWords.length}
          </span>
          <div className="flex gap-1.5">
            {dueWords.slice(0, 20).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-2.5 h-2.5 bg-primary-500 dot-active'
                    : i < currentIndex
                    ? 'w-2 h-2 bg-primary-300'
                    : 'w-2 h-2 bg-surface-200'
                }`}
              />
            ))}
            {dueWords.length > 20 && (
              <span className="text-xs text-surface-400 ml-1 self-center">+{dueWords.length - 20}</span>
            )}
          </div>
        </div>

        {/* Card */}
        <div
          className={`card-flip h-72 sm:h-80 mb-6 cursor-pointer select-none ${
            flash === 'known' ? 'flash-known' : flash === 'unknown' ? 'flash-unknown' : ''
          } ${feedbackClass}`}
          onClick={() => {
            if (animating) return
            setFlipped(prev => {
              const next = !prev
              if (next) playFlip()
              return next
            })
          }}
        >
          <div className={`card-flip-inner relative w-full h-full ${flipped ? 'flipped' : ''}`}>
            {/* Front */}
            <div className="card-face absolute inset-0 bg-white rounded-2xl shadow-soft border border-surface-100 p-6 sm:p-8 flex flex-col items-center justify-center">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-400 rounded-t-2xl" />
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
              <button
                onClick={(e) => { e.stopPropagation(); toggleStarred(currentWord.id); setStarred(!starred); setStarAnim(true); (starred ? playStarOff : playStarOn)() }}
                className={`absolute top-3 left-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 star-btn ${
                  starred
                    ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                    : 'text-surface-300 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
              >
                <Star className={`w-5 h-5 ${starred ? 'fill-yellow-500' : ''} ${starAnim ? 'star-pop' : ''}`} onAnimationEnd={() => setStarAnim(false)} />
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
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-400 rounded-t-2xl" />
              <button
                onClick={(e) => { e.stopPropagation(); toggleStarred(currentWord.id); setStarred(!starred); setStarAnim(true); (starred ? playStarOff : playStarOn)() }}
                className={`absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 star-btn ${
                  starred
                    ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                    : 'text-surface-300 hover:text-yellow-500 hover:bg-yellow-50'
                }`}
              >
                <Star className={`w-5 h-5 ${starred ? 'fill-yellow-500' : ''} ${starAnim ? 'star-pop' : ''}`} onAnimationEnd={() => setStarAnim(false)} />
              </button>
              <div className="text-center mb-5">
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full font-medium mb-4 border border-primary-100">
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
            <MessageCircle className="w-4 h-4 text-primary-400 shrink-0" />
            <span className="text-sm text-primary-500 font-medium italic">{humorMsg}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={() => handleResponse(false)}
            disabled={animating}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-white border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 btn-press font-medium disabled:opacity-50 transition-all duration-200 min-h-[52px] shadow-sm hover:shadow-md"
          >
            <X className="w-5 h-5" />
            <span className="hidden xs:inline">不认识</span>
          </button>
          <div className="flex items-center justify-center w-12 text-surface-200 text-xs font-medium">或</div>
          <button
            onClick={() => handleResponse(true)}
            disabled={animating}
            className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 btn-press font-medium disabled:opacity-50 transition-all duration-200 min-h-[52px] shadow-md hover:shadow-lg active:shadow-sm"
          >
            <Check className="w-5 h-5" />
            <span className="hidden xs:inline">认识</span>
          </button>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-xs text-surface-300 mt-4">
          按 <kbd className="px-1.5 py-0.5 bg-surface-100 rounded text-surface-400 font-mono text-[11px] border border-surface-200">←</kbd> 不认识 ·
          按 <kbd className="px-1.5 py-0.5 bg-surface-100 rounded text-surface-400 font-mono text-[11px] border border-surface-200">→</kbd> 认识
        </p>
      </div>
    </div>
  )
}
