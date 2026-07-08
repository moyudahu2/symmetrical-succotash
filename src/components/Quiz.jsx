import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import wordsData from '../data/words'
import { Check, X, ArrowRight, RotateCcw, Volume2, BarChart3, BookOpen } from 'lucide-react'
import { playClick, playSuccess, playFail } from '../utils/audio'
import useTTS from '../hooks/useTTS'
import BackButton from './BackButton'
import WordImage from './WordImage'
import SpeakerBtn from './SpeakerBtn'
import { CORRECT, WRONG, DONE, LOADING, EMOJI_CORRECT, EMOJI_WRONG, PROGRESS_PHRASES, EASTER_EGG_CONFIG, checkMilestone, isEggCooldownElapsed, markEggShown, pick } from '../utils/humorConstants'
import EasterEgg from './EasterEgg'
import { useFish } from '../utils/FishContext'

const defGroups = wordsData.reduce((acc, w) => {
  if (!acc[w.definition]) acc[w.definition] = []
  acc[w.definition].push(w)
  return acc
}, {})

const groupList = Object.entries(defGroups)

function pickDistractors(correctDef, count) {
  const others = groupList.filter(([def]) => def !== correctDef)
  const shuffled = others.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(([, words]) => {
    const picked = words[Math.floor(Math.random() * words.length)]
    return picked.definition
  })
}

export default function Quiz() {
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [isFinished, setIsFinished] = useState(false)
  const [animOption, setAnimOption] = useState(null)
  const [autoAdvancing, setAutoAdvancing] = useState(false)
  const [humorMsg, setHumorMsg] = useState(null)
  const [humorEmoji, setHumorEmoji] = useState(null)
  const [consecCorrect, setConsecCorrect] = useState(0)
  const [showEgg, setShowEgg] = useState(false)
  const lastTimeCheck = useRef(Date.now())
  const [progressPhrase] = useState(() => pick(PROGRESS_PHRASES))
  const optionRefs = useRef([])
  const autoAdvanceTimer = useRef(null)

  useEffect(() => {
    return () => { if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current) }
  }, [])

  useEffect(() => {
    generateQuestions()
  }, [])

  function generateQuestions() {
    const shuffled = [...wordsData].sort(() => Math.random() - 0.5)
    const picked = shuffled.slice(0, 10)

    const generated = picked.map(word => {
      const distractors = pickDistractors(word.definition, 3)
      const options = [word.definition, ...distractors].sort(() => Math.random() - 0.5)
      return {
        word: word.word,
        phonetic: word.phonetic,
        correctAnswer: word.definition,
        pos: word.pos || '',
        example: word.example || '',
        exampleTranslation: word.exampleTranslation || '',
        options,
      }
    })

    setQuestions(generated)
    setCurrentIndex(0)
    setSelected(null)
    setShowResult(false)
    setScore({ correct: 0, total: 0 })
    setIsFinished(false)
    setAnimOption(null)
  }

  const current = questions[currentIndex]

  const handleSelect = useCallback((option) => {
    if (showResult) return
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current)
    playClick()
    speak(current.word, { immediate: true })
    setSelected(option)
    setShowResult(true)

    const isCorrect = option === current.correctAnswer
    setAnimOption(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) {
      setTimeout(() => playSuccess(), 80)
      setHumorMsg(pick(CORRECT))
      setHumorEmoji(pick(EMOJI_CORRECT))
      setTimeout(() => { setHumorMsg(null); setHumorEmoji(null) }, 2000)
      const nextConsec = consecCorrect + 1
      setConsecCorrect(nextConsec)
      if (nextConsec % 5 === 0) addFish(5, '鎽搁奔澶у笀')
      if (nextConsec % EASTER_EGG_CONFIG.consecCorrectThreshold === 0 && Math.random() < EASTER_EGG_CONFIG.triggerProbability && isEggCooldownElapsed()) {
        markEggShown()
        setShowEgg(true)
      }
      setAutoAdvancing(true)
      autoAdvanceTimer.current = setTimeout(() => {
        autoAdvanceTimer.current = null
        setAutoAdvancing(false)
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(i => i + 1)
          setSelected(null)
          setShowResult(false)
          setAnimOption(null)
        } else {
          setIsFinished(true)
        }
      }, 900)
    } else {
      setTimeout(() => playFail(), 80)
      setHumorMsg(pick(WRONG))
      setHumorEmoji(pick(EMOJI_WRONG))
      setTimeout(() => { setHumorMsg(null); setHumorEmoji(null) }, 2500)
      setConsecCorrect(0)
    }

    // Time-based egg check (low probability)
    const elapsed = Date.now() - lastTimeCheck.current
    if (elapsed >= EASTER_EGG_CONFIG.timeThresholdMinutes * 60000) {
      lastTimeCheck.current = Date.now()
      if (Math.random() < EASTER_EGG_CONFIG.triggerProbability && isEggCooldownElapsed()) {
        markEggShown()
        setShowEgg(true)
      }
    }

    // Milestone check (guaranteed one-time)
    if (isEggCooldownElapsed()) {
      let studiedCount = 0
      try {
        const raw = JSON.parse(localStorage.getItem('srsProgress') || '{}')
        studiedCount = Object.keys(raw).length
      } catch {}
      const milestone = checkMilestone(studiedCount)
      if (milestone) {
        markEggShown()
        setShowEgg(true)
      }
    }

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
  }, [showResult, current, currentIndex, questions.length])

  const handleNext = useCallback(() => {
    if (autoAdvanceTimer.current) { clearTimeout(autoAdvanceTimer.current); autoAdvanceTimer.current = null }
    setAutoAdvancing(false)
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
      setSelected(null)
      setShowResult(false)
      setAnimOption(null)
    } else {
      setIsFinished(true)
    }
  }, [currentIndex, questions.length])

  const { addFish } = useFish()
  const { speaking, autoplayBlocked, toggle: speakWord, speak, preload } = useTTS()

  useEffect(() => {
    if (current) {
      speak(current.word, { isAutoplay: true })
      // Preload next word
      const nextIdx = currentIndex + 1
      if (nextIdx < questions.length) {
        const nextWord = questions[nextIdx].word
        setTimeout(() => preload(), 200)
        setTimeout(() => preload(), 800)
      }
    }
  }, [current?.word])

  const restart = useCallback(() => {
    generateQuestions()
  }, [])

  if (isFinished) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    const grade = pct >= 90 ? { emoji: '馃専', label: '澶浜嗭紒鎺屾彙寰楀緢濂斤紒', color: 'from-green-400 to-emerald-500' }
      : pct >= 70 ? { emoji: '馃憤', label: '涓嶉敊锛岀户缁姞娌癸紒', color: 'from-primary-400 to-primary-500' }
      : pct >= 50 ? { emoji: '馃挭', label: '闇€瑕佸鍔犲涔狅紒', color: 'from-yellow-400 to-orange-500' }
      : { emoji: '馃摉', label: '鍒伆蹇冿紝澶氱粌涔犲氨浼氳繘姝ワ紒', color: 'from-surface-400 to-surface-500' }

    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 sm:p-10 text-center max-w-md w-full animate-[scale-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)]">
          <div className="w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-primary-50 to-primary-100 rounded-full flex items-center justify-center text-4xl shadow-inner">
            {grade.emoji}
          </div>
          <h2 className="text-2xl font-bold text-surface-800 mb-2 font-display">{pick(DONE)}</h2>
          <div className="relative my-6">
            <div className="w-28 h-28 mx-auto rounded-full bg-surface-50 flex items-center justify-center border-4 border-surface-100">
              <span className="text-4xl font-bold text-gradient">{pct}%</span>
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-400 animate-spin-slow pointer-events-none" />
          </div>
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{score.correct}</div>
              <div className="text-xs text-surface-400">姝ｇ‘</div>
            </div>
            <div className="w-px h-8 bg-surface-200" />
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{score.total - score.correct}</div>
              <div className="text-xs text-surface-400">閿欒</div>
            </div>
          </div>
          <p className="text-surface-500 text-sm mb-6">{grade.label}</p>
          <button
            onClick={restart}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 btn-press font-medium shadow-soft transition-all duration-200 min-h-[48px]"
          >
            <RotateCcw className="w-4 h-4" />
            鍐嶆潵涓€杞?          </button>
        </div>
      </div>
    )
  }

  if (!current) return null

  const progress = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  return (
    <div className="flex flex-col items-center px-4 py-6 sm:py-10">
      <BackButton />
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-surface-400">
              {progressPhrase.replace('{remain}', questions.length - currentIndex - 1).replace('{done}', Math.round((currentIndex / questions.length) * 100))}
            </span>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-surface-300" />
              <span className="text-sm font-medium text-green-500">{score.correct}</span>
              <span className="text-surface-300 text-sm">/</span>
              <span className="text-sm text-surface-400">{score.total}</span>
            </div>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6 sm:p-8 mb-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <h2 className="text-4xl sm:text-5xl font-bold text-surface-800 font-display tracking-tight">
              {current.word}
            </h2>
            <button
              onClick={() => speakWord(current.word)}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
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
          </div>
          <p className="text-surface-400 mb-5">{current.phonetic}</p>
          <div className="w-12 h-0.5 bg-gradient-to-r from-primary-300 to-primary-500 mx-auto rounded-full" />
          <p className="text-surface-400 text-sm mt-4">请选择正确的中文释义</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {current.options.map((option, i) => {
            const isCorrectOption = option === current.correctAnswer
            const isSelected = selected === option
            const isCorrectAnim = animOption === 'correct' && isCorrectOption
            const isWrongAnim = animOption === 'wrong' && isSelected && !isCorrectOption

            let btnClass = 'bg-white border-surface-200 hover:border-primary-300 hover:bg-primary-50 text-surface-700 hover:shadow-sm'
            let ringClass = ''

            if (showResult) {
              if (isCorrectOption) {
                btnClass = 'bg-green-50 border-green-400 text-green-700 ring-2 ring-green-200'
                ringClass = 'ring-correct'
              } else if (isSelected && !isCorrectOption) {
                btnClass = 'bg-red-50 border-red-400 text-red-700 ring-2 ring-red-200'
                ringClass = 'ring-wrong'
              } else {
                btnClass = 'bg-white border-surface-200 text-surface-400'
              }
            }

            const animClass = isCorrectAnim ? 'option-bounce' : isWrongAnim ? 'option-shake' : ''

            return (
              <button
                key={i}
                ref={el => optionRefs.current[i] = el}
                onClick={() => handleSelect(option)}
                disabled={showResult}
                className={`w-full text-left px-5 py-4 border-2 rounded-xl btn-press font-medium transition-all duration-200 min-h-[52px] ${btnClass} ${ringClass} ${animClass}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-200 ${
                      showResult && isCorrectOption
                        ? 'border-green-400 bg-green-50 text-green-600'
                        : showResult && isSelected && !isCorrectOption
                        ? 'border-red-400 bg-red-50 text-red-600'
                        : 'border-surface-300 text-surface-400'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                  </span>
                  {showResult && isCorrectOption && (
                    <Check className="w-5 h-5 text-green-500 shrink-0 ml-2 animate-[scale-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]" />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <X className="w-5 h-5 text-red-500 shrink-0 ml-2 animate-[scale-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]" />
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Error explanation card */}
        {showResult && selected !== current.correctAnswer && current.example && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            transition={{ duration: 0.3, ease: [0.25, 0.4, 0.25, 1] }}
            className="mt-5 overflow-hidden"
          >
            <div className="bg-red-50/80 border-l-4 border-red-400 rounded-xl p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-red-500 shrink-0" />
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wide">上下文记忆</span>
              </div>
              <p className="text-sm text-surface-700 leading-relaxed mb-2 italic flex items-start gap-1.5">
                <span>"{current.example}"</span>
                <SpeakerBtn text={current.example} className="mt-0.5" />
              </p>
              <p className="text-xs text-surface-500 leading-relaxed">
                {current.exampleTranslation}
              </p>
              <WordImage word={current} className="mb-3" />
              <div className="mt-3 pt-3 border-t border-red-200/60 flex items-center gap-2">
                <span className="text-[11px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-medium">{current.pos}</span>
                <span className="text-xs text-surface-400">
                  正确答案：<span className="font-semibold text-green-600">{current.correctAnswer}</span>
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Next button */}
        {showResult && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.15 }}
            onClick={handleNext}
            className="mt-5 w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 btn-press font-medium shadow-soft transition-all duration-200 min-h-[52px]"
          >
            {autoAdvancing ? (
              <>鍗冲皢璺宠浆...</>
            ) : currentIndex < questions.length - 1 ? (
              <>涓嬩竴棰?<ArrowRight className="w-4 h-4" /></>
            ) : (
              <>鏌ョ湅缁撴灉 <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        )}

        {/* Humor feedback */}
        {humorMsg && (
          <div className="flex items-center justify-center gap-2 mt-5 mb-2 animate-[fade-down_0.3s_ease-out]">
            {humorEmoji && <span className="text-xl animate-[scale-in_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">{humorEmoji}</span>}
            <span className="text-sm text-primary-500 font-medium italic">{humorMsg}</span>
          </div>
        )}
      </div>
      <EasterEgg show={showEgg} onClose={() => setShowEgg(false)} />
    </div>
  )
}

