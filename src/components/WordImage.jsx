import { useState } from 'react'
import { Zap, Sparkles, MoveRight, FileText, HelpCircle } from 'lucide-react'
import { getWordImageTier, getImageUrl, getGradientColors, getIconName } from '../utils/wordImage'

const ICON_MAP = { Zap, Sparkles, MoveRight, FileText, HelpCircle }

export default function WordImage({ word, className = '' }) {
  const [imgError, setImgError] = useState(false)
  const tier = getWordImageTier(word)

  // Tier 3: render nothing
  if (tier === 3) return null

  // Tier 1: Unsplash image
  if (tier === 1 && !imgError) {
    return (
      <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ aspectRatio: '4/3' }}>
        <img
          src={getImageUrl(word)}
          alt={word.word}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      </div>
    )
  }

  // Tier 2: gradient placeholder with icon (fallback for Tier 1 errors too)
  const [gradient, textColor] = getGradientColors(word)
  const IconComp = ICON_MAP[getIconName(word)] || HelpCircle

  return (
    <div
      className={`relative rounded-xl overflow-hidden flex items-center justify-center ${gradient} ${className}`}
      style={{ aspectRatio: '4/3', minHeight: 80 }}
    >
      <IconComp className={`w-10 h-10 ${textColor} opacity-60`} />
      <span className={`absolute bottom-2 right-2 text-[10px] ${textColor} opacity-40 font-medium`}>
        {word.pos}
      </span>
    </div>
  )
}
