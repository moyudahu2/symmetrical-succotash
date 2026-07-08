import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { SKINS, loadUnlocked, saveUnlocked, loadEquipped, saveEquipped } from '../data/skins'
import { useFish } from './FishContext'

function applyTheme(colors) {
  const root = document.documentElement
  Object.entries(colors).forEach(([key, val]) => {
    root.style.setProperty(`--skin-${key}`, val)
  })
}

function resetTheme() {
  const root = document.documentElement
  const defaultSkin = SKINS.find(s => s.id === 'default_blue')
  if (defaultSkin) applyTheme(defaultSkin.colors)
}

const SkinContext = createContext(null)

export function SkinProvider({ children }) {
  const { count, addFish } = useFish()
  const [unlocked, setUnlocked] = useState(loadUnlocked)
  const [equipped, setEquipped] = useState(loadEquipped)
  const [confirmSkin, setConfirmSkin] = useState(null)

  useEffect(() => {
    const skin = SKINS.find(s => s.id === equipped)
    if (skin) applyTheme(skin.colors)
  }, [equipped])

  const purchaseAndEquip = useCallback((skinId) => {
    const skin = SKINS.find(s => s.id === skinId)
    if (!skin || unlocked.includes(skinId)) return false
    if (count < skin.cost) return false
    addFish(-skin.cost)
    const next = [...unlocked, skinId]
    setUnlocked(next)
    saveUnlocked(next)
    setEquipped(skinId)
    saveEquipped(skinId)
    applyTheme(skin.colors)
    setConfirmSkin(null)
    return true
  }, [count, unlocked, addFish])

  const equip = useCallback((skinId) => {
    if (!unlocked.includes(skinId)) return
    setEquipped(skinId)
    saveEquipped(skinId)
  }, [unlocked])

  return (
    <SkinContext.Provider value={{ unlocked, equipped, purchaseAndEquip, equip, confirmSkin, setConfirmSkin }}>
      {children}
    </SkinContext.Provider>
  )
}

export function useSkin() {
  const ctx = useContext(SkinContext)
  if (!ctx) throw new Error('useSkin must be used within SkinProvider')
  return ctx
}
