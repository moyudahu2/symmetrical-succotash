import { motion, AnimatePresence } from 'framer-motion'
import { useFish } from '../utils/FishContext'

export default function FishRain() {
  const { rain } = useFish()

  return (
    <div className="fixed inset-0 pointer-events-none z-[65] overflow-hidden">
      <AnimatePresence>
        {rain.map(drop => (
          <motion.div
            key={drop.id}
            initial={{ opacity: 1, y: -30, x: 0, rotate: 0, scale: 0.6 }}
            animate={{ opacity: 0, y: '100vh', rotate: 360, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: drop.duration, delay: drop.delay, ease: 'easeIn' }}
            className="absolute"
            style={{ left: `${drop.left}%`, fontSize: drop.size }}
          >
            🐟
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
