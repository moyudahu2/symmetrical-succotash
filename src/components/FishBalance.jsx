import { Fish } from 'lucide-react'
import { useFish } from '../utils/FishContext'

export default function FishBalance() {
  const { count } = useFish()

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-2 bg-white/80 backdrop-blur-md border border-amber-100/80 rounded-xl shadow-soft text-xs font-medium">
      <Fish className="w-3.5 h-3.5 text-amber-500" />
      <span className="text-amber-700 font-bold">{count}</span>
    </div>
  )
}
