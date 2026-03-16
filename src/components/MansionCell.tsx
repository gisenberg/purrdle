import CatSprite from './CatSprite'
import type { Cell } from '../lib/mansion'
import cellEmptyUrl from '../assets/cell-empty.png'

interface MansionCellProps {
  idx: number
  cell: Cell
  isSource: boolean
  isValidTarget: boolean
  isHovered: boolean
  isMerging: boolean
  isSpawning: boolean
  onPointerDown: (idx: number, e: React.PointerEvent) => void
}

export default function MansionCell({
  idx,
  cell,
  isSource,
  isValidTarget,
  isHovered,
  isMerging,
  isSpawning,
  onPointerDown,
}: MansionCellProps) {
  let cellClass = 'aspect-square rounded-lg flex items-center justify-center transition-all duration-150 relative overflow-visible '

  if (isSource) {
    cellClass += 'opacity-40 '
  } else if (isHovered && isValidTarget) {
    cellClass += 'ring-2 ring-pink-400 scale-105 brightness-110 '
  } else if (isHovered && cell === null) {
    cellClass += 'ring-1 ring-pink-300 brightness-105 '
  } else if (isValidTarget) {
    cellClass += 'ring-1 ring-pink-300 '
  }

  if (isMerging) cellClass += 'mansion-merge-pop '
  if (isSpawning) cellClass += 'mansion-spawn-in '

  return (
    <div
      className={cellClass}
      data-cell-idx={idx}
      onPointerDown={(e) => cell && onPointerDown(idx, e)}
      style={{
        cursor: cell ? 'grab' : 'default',
        backgroundImage: `url(${cellEmptyUrl})`,
        backgroundSize: 'cover',
      }}
    >
      {cell && !isSource && (
        <div className="absolute inset-0 flex items-center justify-center">
          <CatSprite cat={cell} />
        </div>
      )}
    </div>
  )
}
