import { useState } from 'react'
import { Zap, Sparkles, MoveRight, FileText, HelpCircle } from 'lucide-react'
import {
  TIER,
  getWordImageTier,
  getUnsplashUrl,
  getPollinationsUrl,
  getGradientColors,
  getIconName,
} from '../utils/wordImage'

const ICON_MAP = { Zap, Sparkles, MoveRight, FileText, HelpCircle }

export default function WordImage({ word, className = '' }) {
  const [imgError, setImgError] = useState(false)
  const tier = getWordImageTier(word)

  // Tier 4 (FUNCTION): hide entirely
  if (tier === TIER.FUNCTION) return null

  // Tier 0 (HIGH_FREQ) & Tier 1 (CONCRETE): Unsplash image
  if ((tier === TIER.HIGH_FREQ || tier === TIER.CONCRETE) && !imgError) {
    return (
      <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ aspectRatio: '4/3' }}>
        <img
          src={getUnsplashUrl(word)}
          alt={word.word}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  // Tier 2 (ABSTRACT): Pollinations.ai generated image
  if (tier === TIER.ABSTRACT && !imgError) {
    return (
      <div className={`relative rounded-xl overflow-hidden bg-surface-50 ${className}`} style={{ aspectRatio: '4/3' }}>
        <img
          src={getPollinationsUrl(word)}
          alt={word.word}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  // Tier 3 (VERB_ADJ) + fallback for any tier whose image failed: gradient + icon
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
