import { Volume2 } from 'lucide-react'

export default function SpeakerBtn({ text, className = '' }) {
  const handleClick = (e) => {
    e.stopPropagation()
    if (!('speechSynthesis' in window) || !text) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'
    u.rate = 0.85
    window.speechSynthesis.speak(u)
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-primary-100 text-surface-300 hover:text-primary-500 transition-all duration-150 shrink-0 ${className}`}
      title="朗读例句"
    >
      <Volume2 className="w-3.5 h-3.5" />
    </button>
  )
}
