const AudioCtx = window.AudioContext || window.webkitAudioContext
let ctx = null
function getCtx() {
  if (!ctx) ctx = new AudioCtx()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/** Short rising arpeggio for correct answers */
export function playSuccess() {
  const ac = getCtx()
  const now = ac.currentTime
  const notes = [261.63, 329.63, 392.00]
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.22, now + i * 0.07)
    gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.45)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(now + i * 0.07)
    osc.stop(now + i * 0.07 + 0.45)

    const osc2 = ac.createOscillator()
    const gain2 = ac.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = freq * 2
    gain2.gain.setValueAtTime(0.05, now + i * 0.07)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + i * 0.07 + 0.3)
    osc2.connect(gain2)
    gain2.connect(ac.destination)
    osc2.start(now + i * 0.07)
    osc2.stop(now + i * 0.07 + 0.3)
  })
}

/** Descending buzz for wrong answers */
export function playFail() {
  const ac = getCtx()
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(220, now)
  osc.frequency.exponentialRampToValueAtTime(90, now + 0.45)
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.5)
}

/** Brief click for buttons / navigation */
export function playClick() {
  const ac = getCtx()
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.value = 800
  gain.gain.setValueAtTime(0.08, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.06)
  const osc2 = ac.createOscillator()
  const gain2 = ac.createGain()
  osc2.type = 'sine'
  osc2.frequency.value = 1200
  gain2.gain.setValueAtTime(0.04, now)
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04)
  osc2.connect(gain2)
  gain2.connect(ac.destination)
  osc2.start(now)
  osc2.stop(now + 0.04)
}

/** Page-flip / card-flip swoosh */
export function playFlip() {
  const ac = getCtx()
  const now = ac.currentTime
  const sr = ac.sampleRate
  const len = Math.floor(sr * 0.12)
  const buf = ac.createBuffer(1, len, sr)
  const data = buf.getChannelData(0)
  for (let i = 0; i < len; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2)
  }
  const src = ac.createBufferSource()
  src.buffer = buf
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 1800
  bp.Q.value = 0.4
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
  src.connect(bp)
  bp.connect(gain)
  gain.connect(ac.destination)
  src.start(now)
}

/** Soft pop for navigation actions */
export function playNav() {
  const ac = getCtx()
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.05)
  gain.gain.setValueAtTime(0.06, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.08)
}

/** Bright ascending chime — star ON */
export function playStarOn() {
  const ac = getCtx()
  const now = ac.currentTime
  ;[1760, 2640, 3520].forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const t = now + i * 0.035
    gain.gain.setValueAtTime(0.07 - i * 0.015, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(t)
    osc.stop(t + 0.18)
  })
}

/** Low dull thud — star OFF */
export function playStarOff() {
  const ac = getCtx()
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(400, now)
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.12)
  gain.gain.setValueAtTime(0.12, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.15)
}

/** Short whoosh for entering a module */
export function playHubEnter() {
  const ac = getCtx()
  const now = ac.currentTime
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(400, now)
  osc.frequency.exponentialRampToValueAtTime(800, now + 0.08)
  gain.gain.setValueAtTime(0.05, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + 0.12)
}
