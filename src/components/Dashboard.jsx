import { useEffect, useState } from 'react'
import wordsData from '../data/words'
import {
  loadAllProgress,
  calculateStreak,
  getMasteredCount,
  getTodayReviewCount,
  getOverallPercent,
  getDueWords,
  getFocusWordCount,
} from '../utils/srs'
import { getPlanSummary } from '../utils/studyPlan'
import StudyPlanModal from './StudyPlanModal'
import { BookOpen, Calendar, Target, TrendingUp, Clock, CheckCircle, Settings, Zap, AlertTriangle } from 'lucide-react'
import BackButton from './BackButton'

export default function Dashboard() {
  const [stats, setStats] = useState({
    mastered: 0,
    todayReview: 0,
    streak: 0,
    overallPercent: 0,
    dueCount: 0,
    focusCount: 0,
    learning: 0,
    reviewing: 0,
    totalWords: wordsData.length,
  })
  const [summary, setSummary] = useState(null)
  const [showPlan, setShowPlan] = useState(false)

  useEffect(() => {
    function updateStats() {
      const progress = loadAllProgress()
      const values = Object.values(progress)
      setStats({
        mastered: getMasteredCount(),
        todayReview: getTodayReviewCount(wordsData),
        streak: calculateStreak(),
        overallPercent: getOverallPercent(wordsData),
        dueCount: getDueWords(wordsData).length,
        focusCount: getFocusWordCount(wordsData),
        learning: values.filter(p => p.status === 'learning').length,
        reviewing: values.filter(p => p.status === 'reviewing').length,
        totalWords: wordsData.length,
      })
      setSummary(getPlanSummary(wordsData, progress))
    }

    updateStats()
    window.addEventListener('focus', updateStats)
    return () => window.removeEventListener('focus', updateStats)
  }, [])

  const statCards = [
    {
      label: '已掌握单词',
      value: stats.mastered,
      icon: CheckCircle,
      bg: 'from-green-400 to-green-500',
      color: 'text-green-500',
      lightBg: 'bg-green-50',
    },
    {
      label: '今日待复习',
      value: stats.dueCount,
      icon: Clock,
      bg: 'from-orange-400 to-orange-500',
      color: 'text-orange-500',
      lightBg: 'bg-orange-50',
      clickable: true,
      onClick: () => setShowPlan(true),
    },
    {
      label: '连续打卡',
      value: `${stats.streak} 天`,
      icon: Calendar,
      bg: 'from-primary-400 to-primary-500',
      color: 'text-primary-500',
      lightBg: 'bg-primary-50',
    },
    {
      label: '掌握百分比',
      value: `${stats.overallPercent}%`,
      icon: TrendingUp,
      bg: 'from-purple-400 to-purple-500',
      color: 'text-purple-500',
      lightBg: 'bg-purple-50',
    },
  ]

  const progressPercent = stats.totalWords > 0
    ? Math.round((stats.mastered / stats.totalWords) * 100)
    : 0

  return (
    <div className="px-4 py-6 sm:py-8 max-w-lg mx-auto">
      <BackButton />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-surface-800 font-display">学习进度</h2>
          <p className="text-xs text-surface-400 mt-0.5">掌握情况一目了然</p>
        </div>
        <button
          onClick={() => setShowPlan(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm text-surface-500 hover:text-surface-700 bg-surface-50 hover:bg-surface-100 border border-surface-200 rounded-xl transition-all duration-200 min-h-[44px]"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">计划</span>
        </button>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-6">
        {statCards.map((card, i) => {
          const Icon = card.icon
          const bgGradient = card.bg
          return (
            <div
              key={i}
              onClick={card.onClick}
              className={`group bg-white rounded-xl shadow-soft p-4 sm:p-5 border border-surface-100 transition-all duration-200 ${
                card.clickable ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-soft-lg' : 'card-lift'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${card.lightBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-surface-800 mb-0.5 font-display">{card.value}</div>
              <div className="text-xs text-surface-400">{card.label}</div>
            </div>
          )
        })}
      </div>

      {/* Focus words */}
      <div className="bg-white rounded-xl shadow-soft p-5 border border-surface-100 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-700 text-sm">重点词</h3>
              <p className="text-xs text-surface-400">需集中复习的单词</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-red-500 font-display">{stats.focusCount}</div>
            <div className="text-xs text-surface-400">个待攻克</div>
          </div>
        </div>
      </div>

      {/* Today's task */}
      {summary && (
        <div className="bg-white rounded-xl shadow-soft p-5 border border-surface-100 mb-4 animate-[fade-in-left_0.4s_ease-out]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-primary-500" />
              </div>
              <h3 className="font-semibold text-surface-700 text-sm">今日任务进度</h3>
            </div>
            <span className="text-xs text-surface-400 bg-surface-50 px-2 py-1 rounded-full">
              {summary.todayLog.reviewDone + summary.todayLog.newDone} / {summary.plan.dailyReviewLimit + summary.plan.dailyNewWords}
            </span>
          </div>
          <div className="space-y-3">
            <ProgressMini
              label="复习"
              done={summary.todayLog.reviewDone}
              total={summary.plan.dailyReviewLimit}
              color="from-primary-400 to-primary-500"
            />
            <ProgressMini
              label="新词"
              done={summary.todayLog.newDone}
              total={summary.plan.dailyNewWords}
              color="from-accent-400 to-accent-500"
            />
          </div>
        </div>
      )}

      {/* Overall progress */}
      <div className="bg-white rounded-xl shadow-soft p-5 border border-surface-100 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-primary-500" />
            </div>
            <h3 className="font-semibold text-surface-700">整体掌握进度</h3>
          </div>
          <span className="text-sm font-bold text-primary-500 font-display">{progressPercent}%</span>
        </div>
        <div className="w-full bg-surface-100 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600 bg-[length:200%_100%]"
            style={{
              width: `${progressPercent}%`,
              animation: progressPercent > 0 && progressPercent < 100 ? 'gradient-shift 3s ease infinite' : 'none',
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-surface-400">
          <span>{stats.mastered} 已掌握</span>
          <span>{stats.totalWords - stats.mastered} 待学习</span>
        </div>
      </div>

      {/* Learning status distribution */}
      <div className="bg-white rounded-xl shadow-soft p-5 border border-surface-100">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-surface-50 flex items-center justify-center">
            <BarChart3Icon className="w-3.5 h-3.5 text-surface-500" />
          </div>
          <h3 className="font-semibold text-surface-700">学习状态分布</h3>
        </div>
        <div className="space-y-3.5">
          <StatusRow icon={CheckCircle} label="已掌握" count={stats.mastered} color="text-green-500" bg="from-green-400 to-green-500" total={stats.totalWords} />
          <StatusRow icon={BookOpen} label="复习中" count={stats.reviewing} color="text-primary-500" bg="from-primary-400 to-primary-500" total={stats.totalWords} />
          <StatusRow icon={Target} label="学习中" count={stats.learning} color="text-orange-500" bg="from-orange-400 to-orange-500" total={stats.totalWords} />
          <StatusRow icon={Clock} label="未开始" count={stats.totalWords - stats.mastered - stats.reviewing - stats.learning} color="text-surface-400" bg="from-surface-300 to-surface-400" total={stats.totalWords} />
        </div>
      </div>

      {showPlan && <StudyPlanModal onClose={() => setShowPlan(false)} />}
    </div>
  )
}

function BarChart3Icon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  )
}

function ProgressMini({ label, done, total, color }) {
  const pct = total > 0 ? Math.min(100, (done / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-surface-500 w-6 font-medium">{label}</span>
      <div className="flex-1 bg-surface-100 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-surface-400 w-12 text-right tabular-nums">{done}/{total}</span>
    </div>
  )
}

function StatusRow({ icon: Icon, label, count, color, bg, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="group flex items-center gap-3">
      <Icon className={`w-4 h-4 ${color} shrink-0 group-hover:scale-110 transition-transform duration-200`} />
      <span className="text-sm text-surface-500 w-14">{label}</span>
      <div className="flex-1 bg-surface-100 rounded-full h-2.5 overflow-hidden shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${bg}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm text-surface-400 w-8 text-right tabular-nums">{count}</span>
    </div>
  )
}
