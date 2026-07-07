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

  useEffect(() => {
    const last = loadCheckIn()
    const today = todayStr()
    if (last !== today) {
      saveCheckIn(today)
      setCount(c => { const n = c + 10; saveFish(n); return n })
      setDailyBonus(true)
      addToast(10, '今日摸鱼补贴')
    }
  }, [])

  const addToast = useCallback((amount, label) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, amount, label }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 1400)
  }, [])

  const addFish = useCallback((amount, label) => {
    setCount(c => { const n = c + amount; saveFish(n); return n })
    addToast(amount, label)
  }, [addToast])

  return (
    <FishContext.Provider value={{ count, addFish, toasts, dailyBonus, setDailyBonus }}>
      {children}
    </FishContext.Provider>
  )
}

export function useFish() {
  const ctx = useContext(FishContext)
  if (!ctx) throw new Error('useFish must be used within FishProvider')
  return ctx
}
