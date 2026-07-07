import { useState, useRef, useCallback, useEffect } from 'react'

export default function useTTS() {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [autoplayBlocked, setAutoplayBlocked] = useState(false)
  const utteranceRef = useRef(null)
  const checkTimer = useRef(null)
  const warmedRef = useRef(false)

  // Pre-warm speech synthesis: load voices & prime the engine
  useEffect(() => {
    if (!('speechSynthesis' in window) || warmedRef.current) return
    warmedRef.current = true
    // Fire-and-forget: trigger voice loading
    window.speechSynthesis.getVoices()
    // Some browsers (Chrome) load voices asynchronously; re-call to catch them
    if ('onvoiceschanged' in window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices()
    }
    // Warm-up: create and discard an utterance to pre-init the audio context
    try {
      const warm = new SpeechSynthesisUtterance('')
      warm.volume = 0
      window.speechSynthesis.speak(warm)
      // Cancel immediately — the engine is now primed
      setTimeout(() => { window.speechSynthesis.cancel() }, 10)
    } catch { /* ignore */ }
  }, [])

  const internalSpeak = useCallback((word, { isAutoplay, immediate } = {}) => {
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

  // speak: auto-play via requestAnimationFrame for visual-sync (Flashcard, FocusReview)
  const speak = useCallback((word, opts = {}) => {
    if (opts.immediate) return internalSpeak(word, opts)
    requestAnimationFrame(() => { internalSpeak(word, opts) })
    return true
  }, [internalSpeak])

  // Preload hint: re-call getVoices to keep engine primed for next word
  const preload = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.getVoices()
  }, [])

  useEffect(() => {
    return () => { if (checkTimer.current) clearTimeout(checkTimer.current) }
  }, [])

  const stop = useCallback(() => {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
    utteranceRef.current = null
    if (checkTimer.current) { clearTimeout(checkTimer.current); checkTimer.current = null }
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
      internalSpeak(word)
    }
  }, [speaking, paused, internalSpeak, pause, resume])

  const retry = useCallback((word) => {
    setAutoplayBlocked(false)
    internalSpeak(word)
  }, [internalSpeak])

  return { speaking, paused, autoplayBlocked, speak, pause, resume, stop, toggle, retry, preload }
}
