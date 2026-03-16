import {
  BREEDS,
  BREED_LABELS,
  MAX_TIER,
  type Progress,
} from '../lib/mansion'
import CatSprite from './CatSprite'

interface MansionProgressProps {
  progress: Progress
}

export default function MansionProgress({ progress }: MansionProgressProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mt-2 bg-white/70 rounded-xl p-2 backdrop-blur-sm">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {BREEDS.map((breed) => {
          const tier = progress[breed]
          const complete = tier >= MAX_TIER
          const displayTier = tier > 0 ? tier : 1
          return (
            <div
              key={breed}
              className={`flex flex-col items-center gap-0.5 p-1 rounded-lg ${
                complete ? 'bg-pink-100 ring-1 ring-pink-300' : 'bg-white/60'
              }`}
              title={`${BREED_LABELS[breed]}: Tier ${tier}/${MAX_TIER}`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 ${tier === 0 ? 'opacity-30 grayscale' : ''}`}>
                <CatSprite cat={{ id: 0, breed, tier: displayTier }} size="sm" />
              </div>
              <div className="w-full bg-pink-100 rounded-full h-1">
                <div
                  className="bg-pink-400 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${(tier / MAX_TIER) * 100}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
