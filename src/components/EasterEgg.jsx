import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { EASTER_EGGS, pick } from '../utils/humorConstants'

export default function EasterEgg({ show, onClose }) {
  const egg = useRef(null)
  if (show && !egg.current) egg.current = pick(EASTER_EGGS)

  useEffect(() => {
    if (!show) egg.current = null
  }, [show])

  return (
    <AnimatePresence>
      {show && egg.current && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden"
            initial={{ scale: 0.7, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280, mass: 0.8 }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-400 via-accent-400 to-rose-400" />

            <div className="px-6 pt-8 pb-6 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-widest">彩蛋</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>

              <motion.div
                className="text-5xl mt-2 mb-5"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', damping: 14, stiffness: 200, delay: 0.1 }}
              >
                {egg.current.emoji}
              </motion.div>

              <p className="text-base text-surface-700 leading-relaxed font-medium">
                {egg.current.text}
              </p>

              {egg.current.type === 'cold' && (
                <span className="inline-block mt-3 px-2.5 py-0.5 bg-blue-50 text-blue-500 text-[11px] rounded-full font-medium border border-blue-100">
                  冷知识
                </span>
              )}
              {egg.current.type === 'humor' && (
                <span className="inline-block mt-3 px-2.5 py-0.5 bg-amber-50 text-amber-500 text-[11px] rounded-full font-medium border border-amber-100">
                  谐音梗
                </span>
              )}
              {egg.current.type === 'encourage' && (
                <span className="inline-block mt-3 px-2.5 py-0.5 bg-primary-50 text-primary-500 text-[11px] rounded-full font-medium border border-primary-100">
                  反内卷
                </span>
              )}

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onClose}
                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium shadow-soft transition-all"
              >
                继续学习
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
