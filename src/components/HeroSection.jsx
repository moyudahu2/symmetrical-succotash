import { useEffect, useState } from 'react'
import { BookOpen, Brain, BarChart3, Sparkles, ArrowRight, Zap } from 'lucide-react'
import wordsData from '../data/words'
import { calculateStreak, getMasteredCount } from '../utils/srs'

const features = [
  { icon: Brain, label: '智能记忆', desc: '基于 SM-2 算法的科学复习' },
  { icon: BookOpen, label: '趣味测验', desc: '多种题型巩固学习效果' },
  { icon: BarChart3, label: '进度追踪', desc: '可视化学习数据一目了然' },
]

export default function HeroSection({ onEnter }) {
  const [mastered, setMastered] = useState(0)
  const [streak, setStreak] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMastered(getMasteredCount())
    setStreak(calculateStreak())
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-dvh bg-gradient-to-b from-white via-primary-50/20 to-white flex flex-col relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-120px] right-[-120px] w-72 h-72 bg-primary-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-80px] left-[-80px] w-56 h-56 bg-accent-200/20 rounded-full blur-3xl pointer-events-none" />

      <nav className="relative w-full px-5 sm:px-6 py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-surface-800 font-display tracking-tight">幺家学英语</span>
          </div>
        </div>
      </nav>

      <main className="relative flex-1 flex flex-col items-center justify-center px-5 sm:px-6 pb-12">
        <div className={`max-w-lg w-full text-center transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary-50 text-primary-600 rounded-full text-sm font-medium mb-8 border border-primary-100 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            四级词汇 · {wordsData.length.toLocaleString()} 词
          </div>

          {/* Headline */}
          <div className="mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-surface-900 font-display tracking-tight leading-tight mb-4">
              <span className="text-gradient">轻松</span>记单词
            </h1>
            <p className="text-lg sm:text-xl text-surface-400 font-body leading-relaxed">
              每天进步一点点
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-10 flex-wrap">
            <div className="text-center group">
              <div className="text-2xl font-bold text-surface-800 transition-colors group-hover:text-primary-500">{wordsData.length.toLocaleString()}</div>
              <div className="text-xs text-surface-400 mt-0.5">总词汇量</div>
            </div>
            <div className="w-px h-8 bg-surface-200" />
            <div className="text-center group">
              <div className="text-2xl font-bold text-primary-500 transition-colors group-hover:text-primary-600">{mastered}</div>
              <div className="text-xs text-surface-400 mt-0.5">已掌握</div>
            </div>
            <div className="w-px h-8 bg-surface-200" />
            <div className="text-center group">
              <div className="text-2xl font-bold text-accent-500 transition-colors group-hover:text-accent-600">{streak}</div>
              <div className="text-xs text-surface-400 mt-0.5">连续打卡</div>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={onEnter}
            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-semibold rounded-2xl shadow-soft-lg hover:shadow-glow-lg transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5"
          >
            <span>开始学习</span>
            <ArrowRight className="w-5 h-5 transition-all duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>

          {/* Features */}
          <div className="mt-14">
            <div className="flex items-center gap-6 justify-center">
              {features.map((f, i) => {
                const Icon = f.icon
                return (
                  <div key={i} className="group flex flex-col items-center gap-1.5">
                    <div className="w-12 h-12 rounded-xl bg-white border border-surface-100 shadow-soft flex items-center justify-center group-hover:border-primary-200 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
                      <Icon className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform duration-200" />
                    </div>
                    <span className="text-xs font-medium text-surface-500 group-hover:text-surface-700 transition-colors">{f.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
