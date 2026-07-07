import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'saltedFishCount'
const CHECKIN_KEY = 'lastFishCheckIn'

function loadFish() {
  try { return Math.max(0, Number(localStorage.getItem(STORAGE_KEY)) || 0) } catch { return 0 }
}

function saveFish(n) {
  try { localStorage.setItem(STORAGE_KEY, String(n)) } catch {}
}

function loadCheckIn() {
  try { return localStorage.getItem(CHECKIN_KEY) || '' } catch { return '' }
}

function saveCheckIn(date) {
  try { localStorage.setItem(CHECKIN_KEY, date) } catch {}
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const FishContext = createContext(null)

export function FishProvider({ children }) {
  const [count, setCount] = useState(loadFish)
  const [dailyBonus, setDailyBonus] = useState(false)
  const [toasts, setToasts] = useState([])
  const [rain, setRain] = useState([])

  useEffect(() => {
    const last = loadCheckIn()
    const today = todayStr()
    if (last !== today) {
      saveCheckIn(today)
      setCount(c => { const n = c + 10; saveFish(n); return n })
      setDailyBonus(true)
      triggerRain(10)
    }
  }, [])

  const addToast = useCallback((amount, label) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, amount, label }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 1400)
  }, [])

  const triggerRain = useCallback((amount) => {
    const count = Math.min(Math.floor(amount / 2) + 1, 8)
    const drops = Array.from({ length: count }, () => ({
      id: Date.now() + Math.random(),
      left: Math.random() * 90 + 5,
      delay: Math.random() * 0.3,
      duration: 1.2 + Math.random() * 0.8,
      size: 16 + Math.random() * 16,
    }))
    setRain(prev => [...prev, ...drops])
    setTimeout(() => setRain(prev => prev.filter(d => !drops.find(r => r.id === d.id))), 2500)
  }, [])

  const addFish = useCallback((amount, label) => {
    setCount(c => { const n = c + amount; saveFish(n); return n })
    if (amount > 0) triggerRain(amount)
    addToast(amount, label)
  }, [addToast, triggerRain])

  return (
    <FishContext.Provider value={{ count, addFish, toasts, rain, dailyBonus, setDailyBonus }}>
      {children}
    </FishContext.Provider>
  )
}

export function useFish() {
  const ctx = useContext(FishContext)
  if (!ctx) throw new Error('useFish must be used within FishProvider')
  return ctx
}
