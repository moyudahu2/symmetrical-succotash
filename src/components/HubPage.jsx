import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen, Brain, AlertTriangle, Library, LayoutDashboard,
  Sparkles, ArrowRight, Zap, ShoppingBag
} from 'lucide-react'
import wordsData from '../data/words'
import { calculateStreak, getMasteredCount, getFocusWordCount, getDueWords, loadAllProgress } from '../utils/srs'
import { playHubEnter } from '../utils/audio'

const MODULES = [
  {
    key: 'learn', label: '学习', icon: BookOpen,
    desc: '基于 SM-2 算法的智能卡片复习',
    gradient: 'from-primary-400 via-primary-500 to-primary-600',
    bgLight: 'bg-primary-50',
    color: 'text-primary-600',
    badge: null,
  },
  {
    key: 'quiz', label: '测验', icon: Brain,
    desc: '选择题、拼写题等多种题型',
    gradient: 'from-accent-400 via-accent-500 to-accent-600',
    bgLight: 'bg-accent-50',
    color: 'text-accent-600',
    badge: null,
  },
  {
    key: 'focus', label: '重点', icon: AlertTriangle,
    desc: '集中攻克星标词与易错词',
    gradient: 'from-rose-400 via-rose-500 to-rose-600',
    bgLight: 'bg-rose-50',
    color: 'text-rose-600',
    badgeKey: 'focusCount',
  },
  {
    key: 'wordlist', label: '词库', icon: Library,
    desc: '浏览全部 4,375 个四级词汇',
    gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    color: 'text-emerald-600',
    badge: null,
  },
  {
    key: 'dashboard', label: '进度', icon: LayoutDashboard,
    desc: '学习数据统计与打卡记录',
    gradient: 'from-brand-400 via-brand-500 to-brand-600',
    bgLight: 'bg-brand-50',
    color: 'text-brand-600',
    badge: null,
  },
]

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const cardVar = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
  },
}

export default function HubPage() {
  const navigate = useNavigate()
  const [mastered, setMastered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [stats, setStats] = useState({ focusCount: 0, dueCount: 0 })
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    setMastered(getMasteredCount())
    setStreak(calculateStreak())
    const progress = loadAllProgress()
    setStats({
      focusCount: getFocusWordCount(wordsData),
      dueCount: getDueWords(wordsData).length,
    })
    const h = new Date().getHours()
    if (h < 6) setGreeting('夜深了，学习固然好，但也要注意休息')
    else if (h < 9) setGreeting('早安！早起的人儿有四级过')
    else if (h < 12) setGreeting('上午好，今天也是摸鱼的一天呢')
    else if (h < 14) setGreeting('中午了，吃饱了才有力气背单词')
    else if (h < 18) setGreeting('下午好，距离考试又近了一天')
    else if (h < 22) setGreeting('晚上好，再不背单词就来不及了')
    else setGreeting('夜深了，看完这页就睡吧')
  }, [])

  function handleEnter(key) {
    playHubEnter()
    navigate(`/study/${key}`)
  }

  return (
    <div className="min-h-dvh bg-surface-50 flex flex-col">
      {/* Top bar */}
      <header className="px-5 h-16 flex items-center justify-between border-b border-surface-100/60 bg-white/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center shadow-soft">
            <Sparkles className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="text-sm font-bold text-surface-800 font-display tracking-tight">咸鱼学英语</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/study/store')}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 min-h-[36px] transition-all duration-200 font-medium"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>商店</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="text-xs text-surface-400 hover:text-surface-600 px-3.5 py-2 min-h-[36px] rounded-lg hover:bg-surface-100/60 transition-all duration-200"
          >
            退出
          </button>
        </div>
      </header>

      {/* Greeting & stats */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-sm text-surface-400 mb-1">{greeting}</p>
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
          <h1 className="text-2xl font-bold text-surface-900 font-display">功能选择</h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-surface-400">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary-400" />
              <span>待复习 <strong className="text-surface-600">{stats.dueCount}</strong></span>
            </div>
            <div className="w-px h-4 bg-surface-200" />
            <div className="flex items-center gap-1.5">
              <span>已掌握 <strong className="text-primary-500">{mastered}</strong></span>
            </div>
            <div className="w-px h-4 bg-surface-200" />
            <div className="flex items-center gap-1.5">
              <span>连续 <strong className="text-accent-500">{streak}</strong> 天</span>
            </div>
          </div>
        </div>
      </div>

      {/* Module grid */}
      <div className="flex-1 px-5 pt-4 pb-8 overflow-y-auto">
        <motion.div
          className="max-w-lg mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          {MODULES.map(mod => {
            const Icon = mod.icon
            return (
              <motion.button
                key={mod.key}
                variants={cardVar}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleEnter(mod.key)}
                className="relative flex flex-col items-start p-5 sm:p-6 bg-white rounded-2xl border border-surface-100 text-left hover:shadow-soft-lg transition-all duration-200 group"
              >
                {/* Top badge strip */}
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-r ${mod.gradient}`} />

                {/* Icon row */}
                <div className={`w-12 h-12 rounded-xl ${mod.bgLight} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-6 h-6 ${mod.color}`} />
                </div>

                {/* Text */}
                <h3 className="font-bold text-surface-800 text-base mb-1">{mod.label}</h3>
                <p className="text-xs text-surface-400 leading-relaxed">{mod.desc}</p>

                {/* Badge */}
                {mod.badgeKey === 'focusCount' && stats.focusCount > 0 && (
                  <span className="absolute top-3 right-3 flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full">
                    {stats.focusCount}
                  </span>
                )}

                {/* Hover arrow */}
                <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-surface-200 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all duration-200 opacity-0 group-hover:opacity-100" />
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}
