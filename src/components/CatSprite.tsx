import type { CatToken, Breed } from '../lib/mansion'

// Eagerly import all breed sprite PNGs via Vite glob
const breedImages = import.meta.glob(
  '../assets/breeds/individual/**/*.png',
  { eager: true, import: 'default' }
) as Record<string, string>

function getSpriteUrl(breed: Breed, tier: number): string {
  const key = `../assets/breeds/individual/${breed}/tier-${tier}.png`
  return breedImages[key] ?? ''
}

interface CatSpriteProps {
  cat: CatToken
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-[130%] h-[130%]',
  lg: 'w-12 h-12',
}

export default function CatSprite({ cat, size = 'md' }: CatSpriteProps) {
  const url = getSpriteUrl(cat.breed, cat.tier)

  return (
    <img
      src={url}
      alt={`${cat.breed} tier ${cat.tier}`}
      className={`${sizeClasses[size]} object-contain select-none pointer-events-none`}
      draggable={false}
    />
  )
}
