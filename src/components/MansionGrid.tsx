import { forwardRef } from 'react'
import MansionCell from './MansionCell'
import { GRID_COLS, type Grid } from '../lib/mansion'
import type { DragState } from '../hooks/useDragAndDrop'

interface MansionGridProps {
  grid: Grid
  dragState: DragState
  mergedCell: number | null
  spawnedCell: number | null
  onPointerDown: (idx: number, e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerCancel: (e: React.PointerEvent) => void
}

const MansionGrid = forwardRef<HTMLDivElement, MansionGridProps>(
  ({ grid, dragState, mergedCell, spawnedCell, onPointerDown, onPointerMove, onPointerUp, onPointerCancel }, ref) => {
    return (
      <div
        ref={ref}
        className="grid gap-1 w-full max-w-3xl mx-auto touch-none select-none"
        style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {grid.map((cell, idx) => (
          <MansionCell
            key={idx}
            idx={idx}
            cell={cell}
            isSource={dragState.sourceIdx === idx && dragState.isDragging}
            isValidTarget={dragState.validTargets.has(idx)}
            isHovered={dragState.hoverIdx === idx}
            isMerging={mergedCell === idx}
            isSpawning={spawnedCell === idx}
            onPointerDown={onPointerDown}
          />
        ))}
      </div>
    )
  }
)

MansionGrid.displayName = 'MansionGrid'
export default MansionGrid
