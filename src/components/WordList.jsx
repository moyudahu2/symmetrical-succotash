import { useState, useMemo, useEffect, useRef, useCallback, memo } from 'react'
import { Search, Volume2, X as XIcon, Star, ChevronRight } from 'lucide-react'
import { List } from 'react-window'
import wordsData from '../data/words'
import { isStarred, toggleStarred } from '../utils/srs'
import { playStarOn, playStarOff } from '../utils/audio'
import useTTS from '../hooks/useTTS'
import BackButton from './BackButton'
import WordDetailModal from './WordDetailModal'

const ROW_HEIGHT = 72

const Row = memo(function Row({ index, style, data }) {
  const word = data?.words?.[index]
  const starredSet = data?.starredSet
  const onToggleStar = data?.onToggleStar
  const starAnimId = data?.starAnimId
  const setStarAnimId = data?.setStarAnimId
  const onSelect = data?.onSelect
  const speakingWordId = data?.speakingWordId
  const onSpeak = data?.onSpeak
  if (!word) return null
  const starred = starredSet?.has(word.id)
  const animating = starAnimId === word.id
  const isSpeaking = speakingWordId === word.id
  return (
    <div
      style={style}
      onClick={() => onSelect(word)}
      className="flex items-center px-4 sm:px-6 border-b border-surface-50 cursor-pointer transition-all duration-150 hover:bg-primary-50/40 group"
    >
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-surface-800 truncate max-w-[110px] xs:max-w-[160px] sm:max-w-[200px] group-hover:text-primary-700 transition-colors">{word.word}</span>
          <span className="text-xs text-surface-400 shrink-0 hidden sm:inline">{word.phonetic}</span>
          <span className="text-[11px] px-1.5 py-0.5 bg-primary-50 text-primary-600 rounded shrink-0 leading-none font-medium border border-primary-100">{word.pos}</span>
        </div>
        <div className="text-sm text-surface-500 truncate mt-0.5 group-hover:text-surface-600 transition-colors">{word.definition}</div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onToggleStar(word.id); setStarAnimId(word.id); (starred ? playStarOff : playStarOn)() }}
        className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 star-btn ${
          starred
            ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
            : 'text-surface-300 hover:text-yellow-500 hover:bg-yellow-50 opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
        aria-label="星标"
      >
        <Star className={`w-4 h-4 ${starred ? 'fill-yellow-500' : ''} ${animating ? 'star-pop' : ''}`} onAnimationEnd={() => setStarAnimId(null)} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onSpeak(word.id, word.word) }}
        className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl transition-all duration-200 shrink-0 ${
          isSpeaking
            ? 'text-primary-500 bg-primary-50'
            : 'text-surface-300 hover:text-primary-500 hover:bg-primary-50 opacity-0 group-hover:opacity-100 focus:opacity-100'
        }`}
        aria-label="发音"
      >
        {isSpeaking ? (
          <svg className="w-4 h-4 speaker-wave" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="10" width="3" height="4" rx="1" />
            <rect x="10.5" y="8" width="3" height="8" rx="1" />
            <rect x="15" y="6" width="3" height="12" rx="1" />
          </svg>
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>
      <div className="ml-1 text-surface-200 group-hover:text-surface-400 transition-colors">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  )
})

export default function WordList() {
  const [search, setSearch] = useState('')
  const [starFilter, setStarFilter] = useState(false)
  const [starredVersion, setStarredVersion] = useState(0)
  const [starAnimId, setStarAnimId] = useState(null)
  const [selectedWord, setSelectedWord] = useState(null)
  const [speakingWordId, setSpeakingWordId] = useState(null)
  const [dimensions, setDimensions] = useState({ height: 500, width: 400 })
  const inputRef = useRef(null)
  const { speak } = useTTS()
  const starredSet = useMemo(() => new Set(wordsData.filter(w => isStarred(w.id)).map(w => w.id)), [starredVersion])
  const onToggleStar = useCallback((id) => { toggleStarred(id); setStarredVersion(v => v + 1) }, [])

  const filtered = useMemo(() => {
    return wordsData.filter(w => {
      if (starFilter && !starredSet.has(w.id)) return false
      if (search) {
        const q = search.toLowerCase()
        if (!w.word.toLowerCase().includes(q) && !w.definition.includes(q)) return false
      }
      return true
    })
  }, [search, starFilter, starredVersion, starredSet])

  const onSpeak = useCallback((id, word) => {
    setSpeakingWordId(id)
    speak(word)
  }, [speak])

  useEffect(() => {
    if (!speakingWordId) return
    const timer = setTimeout(() => setSpeakingWordId(null), 2000)
    return () => clearTimeout(timer)
  }, [speakingWordId])

  useEffect(() => {
    function calcDimensions() {
      const container = document.getElementById('wordlist-container')
      const searchEl = document.getElementById('wordlist-search')
      if (container && searchEl) {
        const searchBottom = searchEl.getBoundingClientRect().bottom
        const h = window.innerHeight - searchBottom - 8
        setDimensions({
          height: Math.max(200, h),
          width: container.getBoundingClientRect().width,
        })
      }
    }
    calcDimensions()
    window.addEventListener('resize', calcDimensions)
    return () => window.removeEventListener('resize', calcDimensions)
  }, [])

  function clearAllFilters() {
    setSearch('')
    setStarFilter(false)
    inputRef.current?.focus()
  }

  return (
    <div className="flex flex-col h-dvh">
      <BackButton />
      <div id="wordlist-search" className="px-4 pt-4 pb-2 bg-white border-b border-surface-100/80">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索单词或释义..."
              className="w-full pl-10 pr-10 py-3 text-sm bg-surface-50 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all placeholder:text-surface-400"
            />
            {search && (
              <button
                onClick={() => { setSearch(''); inputRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[36px] min-w-[36px] flex items-center justify-center text-surface-400 hover:text-surface-600 rounded-lg hover:bg-surface-100 transition-all"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStarFilter(!starFilter)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 btn-press min-h-[36px] ${
                  starFilter
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 shadow-sm'
                    : 'text-surface-400 hover:text-surface-600 bg-white border border-surface-200 hover:border-surface-300'
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${starFilter ? 'fill-yellow-500' : ''}`} />
                {starFilter ? '星标中' : '只看星标'}
              </button>
            </div>
          </div>

          <div className="text-xs text-surface-400 mt-2 pb-1">
            {filtered.length === wordsData.length
              ? `共 ${wordsData.length.toLocaleString()} 个单词`
              : `找到 ${filtered.length.toLocaleString()} / ${wordsData.length.toLocaleString()} 个单词`
            }
          </div>
        </div>
      </div>

      <div id="wordlist-container" className="flex-1 max-w-md mx-auto w-full">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-surface-400">
            <Search className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">没有匹配的单词</p>
            <button
              onClick={clearAllFilters}
              className="mt-3 text-xs text-primary-500 hover:text-primary-600 underline underline-offset-2"
            >
              清除筛选
            </button>
          </div>
        ) : (
          <List
            height={dimensions.height}
            width={dimensions.width}
            rowCount={filtered.length}
            rowHeight={ROW_HEIGHT}
            rowComponent={Row}
            rowProps={{ data: { words: filtered, starredSet, onToggleStar, starAnimId, setStarAnimId, onSelect: setSelectedWord, speakingWordId, onSpeak } }}
            overscanCount={5}
          />
        )}
      </div>

      {selectedWord && (
        <WordDetailModal word={selectedWord} onClose={() => setSelectedWord(null)} />
      )}
    </div>
  )
}
