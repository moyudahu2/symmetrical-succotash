import { BookOpen, Brain, LayoutDashboard, Library, Sparkles, AlertTriangle } from 'lucide-react'

const tabs = [
  { key: 'learn', label: '学习', icon: BookOpen },
  { key: 'quiz', label: '测验', icon: Brain },
  { key: 'focus', label: '重点', icon: AlertTriangle },
  { key: 'wordlist', label: '词库', icon: Library },
  { key: 'dashboard', label: '进度', icon: LayoutDashboard },
]

export default function Navbar({ activeTab, onTabChange, onHome }) {
  return (
    <nav className="bg-white/90 backdrop-blur-xl border-b border-surface-100/80 sticky top-0 z-50 safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between px-1 sm:px-2">
        <div className="flex items-center gap-2 py-3 px-2 shrink-0">
          <button
            onClick={onHome}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft hover:shadow-md hover:from-primary-500 hover:to-primary-700 transition-all duration-200 active:scale-95"
          >
            <Sparkles className="w-[18px] h-[18px] text-white" />
          </button>
          <span className="font-bold text-surface-800 text-sm sm:text-base hidden xs:inline font-display tracking-tight">幺家学英语</span>
        </div>
        <div className="flex gap-0.5 sm:gap-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`nav-indicator flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 btn-press min-h-[44px] ${
                  isActive
                    ? 'bg-primary-50/80 text-primary-600 shadow-sm active'
                    : 'text-surface-400 hover:text-surface-600 hover:bg-surface-50'
                }`}
              >
                <Icon className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
