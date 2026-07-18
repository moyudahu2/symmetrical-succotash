import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, X, RotateCcw, Volume2, Star, ArrowRight, MessageCircle } from 'lucide-react'
import wordsData from '../data/words'
import { calculateSrs, saveWordProgress, getWordProgress, getDueWords, getDefaultSrs, loadAllProgress, isStarred, toggleStarred } from '../utils/srs'
import { playSuccess, playFail, playFlip, playStarOn, playStarOff } from '../utils/audio'
import useTTS from '../hooks/useTTS'
import { getTodayQueue, markWordStudied, getTodayProgress, loadPlan } from '../utils/studyPlan'
import BackButton from './BackButton'
import { LOADING, CORRECT, WRONG, DONE, EMOJI_CORRECT, EMOJI_WRONG, PROGRESS_PHRASES, LOADING_WORDS, EASTER_EGG_CONFIG, checkMilestone, isEggCooldownElapsed, markEggShown, pick } from '../utils/humorConstants'
import EasterEgg from './EasterEgg'
import WordImage from './WordImage'
import SpeakerBtn from './SpeakerBtn'
import { useFish } from '../utils/FishContext'

const MAX_LOAD_RETRIES = 3

export default function Flashcard() {
  const [dueWords, setDueWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [animating, setAnimating] = useState(false)
  const [flash, setFlash] = useState(null)
  const [feedbackClass, setFeedbackClass] = useState('')
  const [confetti, setConfetti] = useState(false)
  const [consecCorrect, setConsecCorrect] = useState(0)
  const [showEgg, setShowEgg] = useState(false)
  const sessionStart = useRef(Date.now())
  const lastTimeCheck = useRef(Date.now())
  const [starred, setStarred] = useState(false)
  const [starAnim, setStarAnim] = useState(false)
  const [loadingError, setLoadingError] = useState(null)
  const [humorMsg, setHumorMsg] = useState(null)
  const [humorEmoji, setHumorEmoji] = useState(null)
  const [loadingCopy, setLoadingCopy] = useState(LOADING_WORDS)
  const [progressPhrase] = useState(() => pick(PROGRESS_PHRASES))
  const navigate = useNavigate()
  const containerRef = useRef(null)
  const loadAttempt = useRef(0)
  const { addFish } = useFish()

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
    if (!currentWord || animating) {
      if (!currentWord) console.warn('[Flashcard] handleResponse: no currentWord')
      if (animating) console.warn('[Flashcard] handleResponse: animating, skipped')
      return
    }
    console.log(`[Flashcard] handleResponse word="${currentWord.word}" isKnown=${isKnown} currentIndex=${currentIndex}/${dueWords.length - 1}`)
    setAnimating(true)
    setFlash(isKnown ? 'known' : 'unknown')
    setFeedbackClass(isKnown ? 'bounce-correct' : 'shake-wrong')
    if (isKnown) {
      playSuccess(); if (Math.random() < 0.3) { setHumorMsg(pick(CORRECT)); setHumorEmoji(pick(EMOJI_CORRECT)) }; setConfetti(true); setTimeout(() => setConfetti(false), 1200)
      const nextConsec = consecCorrect + 1
      setConsecCorrect(nextConsec)
      if (nextConsec % 5 === 0) addFish(5, '摸鱼大师')
      if (nextConsec % EASTER_EGG_CONFIG.consecCorrectThreshold === 0 && Math.random() < EASTER_EGG_CONFIG.triggerProbability && isEggCooldownElapsed()) {
        markEggShown()
        setShowEgg(true)
      }
    } else {
      playFail(); if (Math.random() < 0.3) { setHumorMsg(pick(WRONG)); setHumorEmoji(pick(EMOJI_WRONG)) }
      setConsecCorrect(0)
    }

    const elapsed = Date.now() - lastTimeCheck.current
    if (elapsed >= EASTER_EGG_CONFIG.timeThresholdMinutes * 60000) {
      lastTimeCheck.current = Date.now()
      if (Math.random() < EASTER_EGG_CONFIG.triggerProbability && isEggCooldownElapsed()) {
        markEggShown()
        setShowEgg(true)
      }
    }

    const prevProgress = getWordProgress(currentWord.id)

    // Schedule SRS save + advancement — must always run to prevent stuck UI
    requestAnimationFrame(() => {
      try {
        const newSrs = calculateSrs(prevProgress, isKnown)
        saveWordProgress(currentWord.id, newSrs)
        markWordStudied(currentWord.id, prevProgress)
        console.log(`[Flashcard] SRS saved for "${currentWord.word}"`)
      } catch (err) {
        console.error('[Flashcard] SRS save failed:', err)
      }

      // Non-critical: milestone egg
      try {
        if (isEggCooldownElapsed()) {
          const studiedCount = (getTodayProgress().wordIds || []).length
          const milestone = checkMilestone(studiedCount)
          if (milestone) { markEggShown(); setShowEgg(true) }
        }
      } catch {}

      setTimeout(() => {
        setHumorMsg(null); setHumorEmoji(null)
        setFlash(null)
        setFeedbackClass('')
        setFlipped(false)
        if (currentIndex < dueWords.length - 1) {
          const next = currentIndex + 1
          console.log(`[Flashcard] Current Index updated to: ${next}`)
          setCurrentIndex(i => i + 1)
        } else {
          console.log('[Flashcard] All words done, showing finish screen')
          setIsDone(true)
        }
        setAnimating(false)
      }, 450)
    })
  }, [currentWord, currentIndex, dueWords.length, animating])


  const { speaking, autoplayBlocked, toggle: speakWord, speak, preload } = useTTS()

  const handleRef = useRef(handleResponse)
  handleRef.current = handleResponse

  const animatingRef = useRef(animating)
  animatingRef.current = animating

  useEffect(() => {
    function onKeyDown(e) {
      if (animatingRef.current) return
      if (!currentWord) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); handleRef.current(false) }
      if (e.key === 'ArrowRight') { e.preventDefault(); handleRef.current(true) }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentWord])

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
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/study')}
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-white border-2 border-primary-200 text-primary-600 rounded-xl hover:bg-primary-50 hover:border-primary-300 btn-press font-medium transition-all duration-200"
            >
              <span>继续学习</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/study/quiz')}
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 btn-press font-medium shadow-lg shadow-primary-200 transition-all duration-200"
            >
              <span>去检验</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
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
      <div className="w-full max-w-md relative">
        {/* Progress indicator */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-surface-400">
              {progressPhrase.replace('{remain}', dueWords.length - currentIndex - 1).replace('{done}', Math.round((currentIndex / dueWords.length) * 100))}
            </span>
            <span className="text-xs font-medium text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">
              {currentIndex + 1} / {dueWords.length}
            </span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-300 via-primary-500 to-accent-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentIndex / dueWords.length) * 100}%` }}
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
              <div className="text-center mb-3">
                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full font-medium mb-3 border border-primary-100">
                  {currentWord.pos}
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold text-surface-800 leading-snug">{currentWord.definition}</h3>
              </div>
              <WordImage word={currentWord} className="mb-3" />
              <div className="bg-gradient-to-br from-surface-50 to-surface-100/30 rounded-xl p-4 text-left border border-surface-100">
                <p className="text-surface-600 text-sm mb-1.5 leading-relaxed italic flex items-start gap-1.5">
                  <span>"{currentWord.example}"</span>
                  <SpeakerBtn text={currentWord.example} className="mt-0.5" />
                </p>
                <p className="text-surface-400 text-xs">{currentWord.exampleTranslation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Confetti burst */}
        {confetti && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10" style={{ perspective: '200px' }}>
            {Array.from({ length: 18 }).map((_, i) => {
              const colors = ['bg-primary-400', 'bg-accent-400', 'bg-green-400', 'bg-yellow-400', 'bg-rose-400', 'bg-blue-400']
              const color = colors[i % colors.length]
              const left = 10 + Math.random() * 80
              const delay = Math.random() * 0.2
              const size = 4 + Math.random() * 6
              return (
                <div
                  key={i}
                  className={`absolute bottom-0 rounded-full ${color} confetti-particle`}
                  style={{
                    left: `${left}%`,
                    width: size, height: size,
                    animationDelay: `${delay}s`,
                    animationDuration: `${0.6 + Math.random() * 0.4}s`,
                  }}
                />
              )
            })}
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

        {/* Humor feedback */}
        {humorMsg && (
          <div className="flex items-center justify-center gap-2 mt-4 animate-[fade-down_0.3s_ease-out]">
            {humorEmoji && <span className="text-xl animate-[scale-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">{humorEmoji}</span>}
            <span className="text-sm text-primary-500 font-medium italic">{humorMsg}</span>
          </div>
        )}
      </div>
      <EasterEgg show={showEgg} onClose={() => setShowEgg(false)} />
    </div>
  )
}
