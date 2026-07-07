import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShoppingBag, Lock, Sparkles, Fish } from 'lucide-react'
import { SKINS } from '../data/skins'
import { useSkin } from '../utils/SkinContext'
import { useFish } from '../utils/FishContext'
import BackButton from './BackButton'

export default function SkinStore() {
  const { unlocked, equipped, purchase, equip, confirmSkin, setConfirmSkin } = useSkin()
  const { count } = useFish()

  function handleAction(skin) {
    if (skin.id === equipped) return
    if (!unlocked.includes(skin.id)) {
      if (count < skin.cost) return
      setConfirmSkin(skin.id)
    } else {
      equip(skin.id)
    }
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 sm:py-10 min-h-dvh" style={{ background: 'var(--skin-bg, #F8FAFC)' }}>
      <BackButton />
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--skin-primary, #3B82F6)' }}>咸鱼商店</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--skin-primary, #3B82F6)', opacity: 0.6 }}>用咸鱼干兑换炫酷皮肤</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: 'var(--skin-primary-light, #E8F0FE)' }}>
            <Fish className="w-4 h-4" style={{ color: 'var(--skin-primary, #3B82F6)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--skin-primary, #3B82F6)' }}>{count}</span>
          </div>
        </div>

        {/* Skin grid */}
        <div className="space-y-4">
          {SKINS.map((skin, i) => {
            const isUnlocked = unlocked.includes(skin.id)
            const isEquipped = equipped === skin.id
            const canAfford = count >= skin.cost

            return (
              <motion.div
                key={skin.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl overflow-hidden border-2 transition-all duration-300"
                style={{
                  borderColor: isEquipped ? skin.colors.primary : 'transparent',
                  boxShadow: isEquipped ? `0 0 0 2px ${skin.colors.primary}20` : undefined,
                }}
              >
                {/* Preview strip */}
                <div className="h-24 relative flex items-end p-4" style={{ background: `linear-gradient(135deg, ${skin.colors.bg}, ${skin.colors.card})` }}>
                  {/* Color dots */}
                  <div className="flex gap-2">
                    {Object.values(skin.colors).slice(0, 3).map((c, j) => (
                      <div key={j} className="w-6 h-6 rounded-full border border-white/30 shadow-sm" style={{ background: c }} />
                    ))}
                  </div>
                  {isEquipped && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-full text-[11px] font-semibold shadow-sm" style={{ color: skin.colors.primary }}>
                      <Check className="w-3 h-3" /> 已装备
                    </div>
                  )}
                </div>

                {/* Info row */}
                <div className="px-4 py-3.5 flex items-center justify-between" style={{ background: skin.colors.card }}>
                  <div>
                    <h3 className="text-sm font-bold" style={{ color: skin.id === 'default_blue' ? undefined : '#ffffffaf' }}>{skin.name}</h3>
                    {!isUnlocked && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs" style={{ color: canAfford ? skin.colors.primary : '#EF4444' }}>
                        {canAfford ? <ShoppingBag className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {canAfford ? `兑换 ${skin.cost} 咸鱼干` : `余额不足 (需 ${skin.cost})`}
                      </div>
                    )}
                  </div>

                  {isEquipped ? (
                    <div className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-surface-100 text-surface-400">已装备</div>
                  ) : isUnlocked ? (
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => equip(skin.id)}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white shadow-sm"
                      style={{ background: skin.colors.primary }}
                    >
                      装备
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: canAfford ? 1.04 : 1 }}
                      whileTap={{ scale: canAfford ? 0.96 : 1 }}
                      onClick={() => handleAction(skin)}
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: canAfford ? skin.colors.primary : '#F1F5F9',
                        color: canAfford ? '#fff' : '#94A3B8',
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <Fish className="w-3 h-3" />
                        {skin.cost}
                      </div>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Insufficient funds hint */}
        {SKINS.some(s => !unlocked.includes(s.id) && count < s.cost) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs mt-6 px-4 py-3 rounded-xl"
            style={{ background: 'var(--skin-primary-light, #FEF2F2)', color: '#EF4444' }}
          >
            咸鱼干余额不足，快去背几个单词赚点外快吧！
          </motion.p>
        )}
      </div>

      {/* Confirmation modal */}
      <AnimatePresence>
        {confirmSkin && (() => {
          const skin = SKINS.find(s => s.id === confirmSkin)
          if (!skin) return null
          return (
            <motion.div
              className="fixed inset-0 z-[60] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setConfirmSkin(null)} />
              <motion.div
                className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full mx-4 p-6 text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: skin.colors.primary + '20' }}>
                  <Sparkles className="w-6 h-6" style={{ color: skin.colors.primary }} />
                </div>
                <h3 className="text-lg font-bold text-surface-800 mb-1">确认购买</h3>
                <p className="text-sm text-surface-400 mb-2">
                  是否花费 <strong className="text-amber-600">{skin.cost} 咸鱼干</strong> 兑换
                </p>
                <p className="text-base font-bold mb-5" style={{ color: skin.colors.primary }}>{skin.name}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmSkin(null)}
                    className="flex-1 px-4 py-3 bg-surface-100 text-surface-600 rounded-xl font-medium btn-press"
                  >
                    再想想
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { purchase(skin.id); equip(skin.id) }}
                    className="flex-1 px-4 py-3 text-white rounded-xl font-medium shadow-soft btn-press"
                    style={{ background: skin.colors.primary }}
                  >
                    确定购买
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
