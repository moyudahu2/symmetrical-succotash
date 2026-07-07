import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { playNav } from '../utils/audio'

export default function BackButton({ to = '/study', label = '返回' }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => { playNav(); navigate(to) }}
      className="fixed top-4 left-4 z-40 flex items-center gap-1.5 px-3.5 py-2.5 bg-white/80 backdrop-blur-md border border-surface-100/80 rounded-xl text-xs font-medium text-surface-500 hover:text-surface-800 hover:border-surface-200 shadow-soft hover:shadow-md transition-all duration-200 active:scale-95 min-h-[44px]"
    >
      <ArrowLeft className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
