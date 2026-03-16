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
    <div className="w-[95vw] max-w-3xl mx-auto mt-2 bg-white/70 rounded-xl p-2 backdrop-blur-sm">
      <div className="grid grid-cols-11 gap-1 sm:gap-1.5">
        {BREEDS.map((breed) => {
          const tier = progress[breed]
          const complete = tier >= MAX_TIER
          // Always show the next tier to achieve as a silhouette.
          // Once that tier is achieved, it becomes the real sprite and
          // the silhouette advances to the tier after that.
          // tier 0 → silhouette of tier 1
          // tier 1 → silhouette of tier 2
          // tier 7 → completed, show tier 7 in full color
          const silhouetteTier = Math.min(tier + 1, MAX_TIER)
          return (
            <div
              key={breed}
              className={`flex flex-col items-center gap-0.5 p-0.5 sm:p-1 rounded-lg ${
                complete ? 'bg-pink-100 ring-1 ring-pink-300' : 'bg-white/60'
              }`}
              title={`${BREED_LABELS[breed]}: Tier ${tier}/${MAX_TIER}`}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8">
                {complete ? (
                  <CatSprite cat={{ id: 0, breed, tier: MAX_TIER }} size="sm" />
                ) : (
                  <div style={{ filter: 'brightness(0) contrast(100%) blur(0.5px)', opacity: 0.8 }}>
                    <CatSprite cat={{ id: 0, breed, tier: silhouetteTier }} size="sm" />
                  </div>
                )}
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
