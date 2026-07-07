import { motion, AnimatePresence } from 'framer-motion'
import { Fish } from 'lucide-react'
import { useFish } from '../utils/FishContext'

export default function FishToast() {
  const { toasts } = useFish()

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.6 }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-lg"
          >
            <Fish className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-amber-700">
              +{t.amount} 咸鱼干
            </span>
            {t.label && (
              <span className="text-[11px] text-amber-500 font-medium ml-1 px-1.5 py-0.5 bg-amber-100/60 rounded-full">
                {t.label}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
