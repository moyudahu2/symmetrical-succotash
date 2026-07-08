import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Volume2, Star, BookOpen, Lightbulb, Bookmark, Newspaper, MessageCircle } from 'lucide-react'
import WordImage from './WordImage'
import SpeakerBtn from './SpeakerBtn'
import useTTS from '../hooks/useTTS'
import { isStarred, toggleStarred } from '../utils/srs'
import { playStarOn, playStarOff } from '../utils/audio'
import { getWordDetail } from '../utils/wordInfo'

function highlightKeyword(text, keyword) {
  if (!text || !keyword) return text
  try {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
    return parts.map((part, i) =>
      part.toLowerCase() === keyword.toLowerCase()
        ? <span key={i} className="text-primary-600 font-semibold bg-primary-50 px-0.5 rounded">{part}</span>
        : part
    )
  } catch {
    return text
  }
}

export default function WordDetailModal({ word, onClose }) {
  const { speaking, speak } = useTTS()
  const detail = useMemo(() => word ? getWordDetail(word) : null, [word?.id])
  const starred = word ? isStarred(word.id) : false

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  // Auto-play example sentence on mount (browser may silently block)
  useEffect(() => {
    if (word?.example) {
      try { speak(word.example) } catch {}
    }
  }, [word?.id])

  const relatedWords = detail?.relatedWords || []

  // ── Empty state ──
  if (!word) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '30%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-20 min-h-[36px] min-w-[36px] flex items-center justify-center bg-white/80 backdrop-blur rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 border border-surface-200 shadow-sm transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-surface-100 flex items-center justify-center mb-5">
                <BookOpen className="w-9 h-9 text-surface-300" />
              </div>
              <h3 className="text-lg font-semibold text-surface-700 mb-2">暂无详细信息</h3>
              <p className="text-sm text-surface-400 leading-relaxed max-w-xs">
                该单词的详细例句正在补充中...
              </p>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        key={word.id}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Panel */}
        <motion.div
          className="relative w-full sm:max-w-lg max-h-[90dvh] sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-y-auto overscroll-contain"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '30%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 min-h-[36px] min-w-[36px] flex items-center justify-center bg-white/80 backdrop-blur rounded-xl text-surface-400 hover:text-surface-600 hover:bg-surface-100 border border-surface-200 shadow-sm transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Image */}
          <div className="h-44 sm:h-52 overflow-hidden rounded-t-2xl relative">
            <WordImage word={word} className="w-full h-full" />
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
          </div>

          {/* Content */}
          <div className="px-5 pb-6 -mt-2 relative">
            {/* Word header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-3xl font-bold text-surface-900 font-display tracking-tight">{word.word}</h2>
                  <span className="text-[11px] px-2 py-0.5 bg-primary-50 text-primary-600 rounded font-medium border border-primary-100">{word.pos}</span>
                </div>
                <p className="text-sm text-surface-400 mt-0.5">{word.phonetic || '—'}</p>
                <p className="text-base text-surface-700 mt-1 font-medium">{word.definition || '暂无释义'}</p>
              </div>
              <div className="flex items-center gap-1 ml-3 shrink-0">
                <button
                  onClick={() => speak(word.word)}
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 ${
                    speaking ? 'text-primary-500 bg-primary-50' : 'text-surface-300 hover:text-primary-500 hover:bg-primary-50'
                  }`}
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
                  onClick={() => { toggleStarred(word.id); (starred ? playStarOff : playStarOn)() }}
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 ${
                    starred ? 'text-yellow-500 bg-yellow-50' : 'text-surface-300 hover:text-yellow-500 hover:bg-yellow-50'
                  }`}
                >
                  <Star className={`w-5 h-5 ${starred ? 'fill-yellow-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Example */}
            {word.example ? (
              <div className="bg-gradient-to-br from-primary-50/40 to-white rounded-xl border border-primary-100/60 p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary-500 shrink-0" />
                  <span className="text-xs font-semibold text-primary-600 uppercase tracking-wide">例句</span>
                </div>
                <p className="text-sm text-surface-700 leading-relaxed mb-2 italic flex items-start gap-1.5">
                  <span>"{highlightKeyword(word.example, word.word)}"</span>
                  <SpeakerBtn text={word.example} className="mt-0.5" />
                </p>
                <p className="text-xs text-surface-500 leading-relaxed">{word.exampleTranslation}</p>
              </div>
            ) : (
              <div className="bg-surface-50 rounded-xl border border-surface-200 border-dashed p-4 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4 text-surface-300 shrink-0" />
                  <span className="text-xs font-semibold text-surface-400 uppercase tracking-wide">例句</span>
                </div>
                <p className="text-sm text-surface-400 italic">暂无例句</p>
              </div>
            )}

            {/* Memory tips */}
            {detail?.rootTip && (
              <div className="bg-gradient-to-br from-accent-50/60 to-white rounded-xl border border-accent-100 p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-accent-500 shrink-0" />
                  <span className="text-xs font-semibold text-accent-600 uppercase tracking-wide">词根记忆</span>
                </div>
                <p className="text-sm text-surface-700 leading-relaxed">{detail.rootTip}</p>
              </div>
            )}

            {/* Related words */}
            {relatedWords.length > 0 && (
              <div className="bg-gradient-to-br from-surface-50/60 to-white rounded-xl border border-surface-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bookmark className="w-4 h-4 text-surface-500 shrink-0" />
                  <span className="text-xs font-semibold text-surface-600 uppercase tracking-wide">同类词汇</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatedWords.map(rw => (
                    <span
                      key={rw.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-surface-200 rounded-lg text-xs text-surface-600 hover:border-primary-200 hover:text-primary-600 transition-colors"
                    >
                      <span className="font-medium">{rw.word}</span>
                      <span className="text-surface-400">·</span>
                      <span className="text-surface-400">{rw.pos}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="h-4" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
