import { useState, useRef, useCallback, useEffect } from 'react'

export default function useTTS() {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const utteranceRef = useRef(null)
  const checkTimer = useRef(null)

  const stop = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
    utteranceRef.current = null
    if (checkTimer.current) { clearTimeout(checkTimer.current); checkTimer.current = null }
  }, [])

  const speak = useCallback((word, { isAutoplay } = {}) => {
    if (!('speechSynthesis' in window)) return false
    window.speechSynthesis.cancel()
    if (checkTimer.current) { clearTimeout(checkTimer.current); checkTimer.current = null }

    const u = new SpeechSynthesisUtterance(word)
    u.lang = 'en-US'
    u.rate = 0.9
    let started = false
    u.onstart = () => { started = true; setSpeaking(true); setPaused(false); setAutoplayBlocked(false) }
    u.onend = () => { setSpeaking(false); setPaused(false); utteranceRef.current = null }
    u.onerror = () => { setSpeaking(false); setPaused(false); utteranceRef.current = null }
    utteranceRef.current = u
    window.speechSynthesis.speak(u)

    if (isAutoplay) {
      checkTimer.current = setTimeout(() => {
        if (!started && !window.speechSynthesis.speaking) {
          setAutoplayBlocked(true)
        }
        checkTimer.current = null
      }, 300)
    }

    return true
  }, [])

  useEffect(() => {
    return () => { if (checkTimer.current) clearTimeout(checkTimer.current) }
  }, [])

  const pause = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.pause()
    setPaused(true)
  }, [])

  const resume = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.resume()
    setPaused(false)
  }, [])

  const toggle = useCallback((word) => {
    if (speaking && !paused) {
      pause()
    } else if (paused) {
      resume()
    } else {
      speak(word)
    }
  }, [speaking, paused, speak, pause, resume])

  const retry = useCallback((word) => {
    setAutoplayBlocked(false)
    speak(word)
  }, [speak])

  return { speaking, paused, autoplayBlocked, speak, pause, resume, stop, toggle, retry }
}
