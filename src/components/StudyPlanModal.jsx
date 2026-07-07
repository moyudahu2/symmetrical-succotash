import { useState, useEffect } from 'react'
import { X, BookOpen, RotateCcw, Sparkles, Target } from 'lucide-react'
import { loadPlan, savePlan, getPlanSummary } from '../utils/studyPlan'
import { loadAllProgress } from '../utils/srs'
import wordsData from '../data/words'

export default function StudyPlanModal({ onClose }) {
  const [plan, setPlan] = useState(loadPlan())
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    setSummary(getPlanSummary(wordsData, loadAllProgress()))
  }, [])

  const update = (key, val) => {
    const next = { ...plan, [key]: Math.max(1, Math.min(100, val || 1)) }
    setPlan(next)
    savePlan(next)
    setSummary(getPlanSummary(wordsData, loadAllProgress()))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-soft-lg mx-auto max-h-[90vh] overflow-y-auto animate-[slide-up-bounce_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center shadow-sm">
              <Target className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-surface-800 font-display">学习计划</h2>
              <p className="text-xs text-surface-400">自定义每日学习任务</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-surface-600 touch-target rounded-xl hover:bg-surface-50 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          <SettingSlider
            icon={BookOpen}
            label="每日新词"
            desc="每天学习的新单词数量"
            value={plan.dailyNewWords}
            onChange={v => update('dailyNewWords', v)}
            min={1}
            max={50}
            unit="个"
            color="accent"
          />

          <SettingSlider
            icon={RotateCcw}
            label="复习上限"
            desc="每天最多复习的单词数量"
            value={plan.dailyReviewLimit}
            onChange={v => update('dailyReviewLimit', v)}
            min={5}
            max={100}
            unit="个"
            color="primary"
          />
        </div>

        {/* Summary */}
        {summary && (
          <div className="mt-6 bg-gradient-to-br from-surface-50 to-surface-100/50 rounded-xl p-4 border border-surface-100">
            <h3 className="text-sm font-semibold text-surface-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              今日任务概览
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <SummaryCard
                label="待复习"
                value={summary.reviewRemaining}
                total={summary.totalReviewDue}
                color="text-primary-500"
                bg="bg-primary-50/50"
              />
              <SummaryCard
                label="新单词"
                value={summary.newRemaining}
                total={summary.totalNewAvailable}
                color="text-accent-500"
                bg="bg-accent-50/50"
              />
              <SummaryCard
                label="已完成"
                value={summary.todayLog.reviewDone + summary.todayLog.newDone}
                color="text-green-500"
                bg="bg-green-50/50"
              />
              <SummaryCard
                label="剩余总计"
                value={summary.totalRemaining}
                color="text-surface-500"
                bg="bg-surface-50/50"
              />
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:from-primary-600 hover:to-primary-700 btn-press font-medium shadow-soft transition-all duration-200 min-h-[48px]"
        >
          确认
        </button>
      </div>
    </div>
  )
}

function SettingSlider({ icon: Icon, label, desc, value, onChange, min, max, unit, color }) {
  const trackColor = color === 'accent'
    ? 'accent-accent-500 [&::-webkit-slider-thumb]:bg-accent-500'
    : 'accent-primary-500 [&::-webkit-slider-thumb]:bg-primary-500'

  const fillPercent = ((value - min) / (max - min)) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-surface-400" />
          <span className="text-sm font-medium text-surface-700">{label}</span>
        </div>
        <span className="text-xl font-bold text-surface-800 font-display tabular-nums">{value}<span className="text-sm text-surface-400 ml-0.5 font-normal">{unit}</span></span>
      </div>
      <p className="text-xs text-surface-400 mb-2.5">{desc}</p>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          className={`w-full h-2 bg-surface-200 rounded-full appearance-none cursor-pointer ${trackColor} 
            [&::-webkit-slider-thumb]:appearance-none 
            [&::-webkit-slider-thumb]:w-5 
            [&::-webkit-slider-thumb]:h-5 
            [&::-webkit-slider-thumb]:rounded-full 
            [&::-webkit-slider-thumb]:shadow-soft 
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-150
            [&::-webkit-slider-thumb]:active:scale-110
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:shadow-soft
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-0`}
          style={{
            background: `linear-gradient(to right, ${color === 'accent' ? '#F97316' : '#6366F1'} ${fillPercent}%, #E2E8F0 ${fillPercent}%)`,
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-surface-400 mt-1.5">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, total, color, bg }) {
  return (
    <div className={`${bg} rounded-lg p-3 border border-surface-100/80`}>
      <div className={`text-xl font-bold font-display ${color}`}>
        {value}
        {total !== undefined && <span className="text-sm text-surface-400 font-normal"> / {total}</span>}
      </div>
      <div className="text-xs text-surface-400 mt-0.5">{label}</div>
    </div>
  )
}
