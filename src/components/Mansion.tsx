import { useRef } from 'react'
import { useMansion } from '../hooks/useMansion'
import { useDragAndDrop } from '../hooks/useDragAndDrop'
import { isBoardFull, isGameComplete } from '../lib/mansion'
import MansionGrid from './MansionGrid'
import MansionProgress from './MansionProgress'
import CatSprite from './CatSprite'
import mansionBgUrl from '../assets/mansion-bg.png'

export default function Mansion() {
  const { state, spawn, merge, move, reset, mergedCell, spawnedCell } = useMansion()
  const gridRef = useRef<HTMLDivElement>(null)
  const { dragState, handlers } = useDragAndDrop(gridRef, state.grid, merge, move)

  const boardFull = isBoardFull(state.grid)
  const complete = isGameComplete(state.progress)

  return (
    <div className="flex flex-col items-center w-full flex-1 min-h-0 gap-2 relative">
      {/* Background */}
      <div
        className="fixed inset-0 z-0 opacity-70 pointer-events-none"
        style={{
          backgroundImage: `url(${mansionBgUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Content - above background */}
      <div className="flex flex-col items-center w-full flex-1 min-h-0 gap-2 relative z-10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-pink-600">
            Mellow's Mansion
          </h2>
          <p className="text-xs text-violet-500">
            Merges: {state.totalMerges}
          </p>
        </div>

        {/* Grid */}
        <MansionGrid
          ref={gridRef}
          grid={state.grid}
          dragState={dragState}
          mergedCell={mergedCell}
          spawnedCell={spawnedCell}
          onPointerDown={handlers.onPointerDown}
          onPointerMove={handlers.onPointerMove}
          onPointerUp={handlers.onPointerUp}
          onPointerCancel={handlers.onPointerCancel}
        />

        {/* Controls */}
        <div className="flex gap-2 items-center">
          <button
            onClick={spawn}
            disabled={boardFull}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
              boardFull
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-pink-500 hover:bg-pink-600 text-white active:scale-95 shadow-md'
            }`}
          >
            {boardFull ? 'Board Full!' : 'New Kitten'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-2 rounded-lg text-xs text-violet-500 hover:bg-violet-50 transition-colors"
          >
            Reset
          </button>
        </div>

        {/* Completion message */}
        {complete && (
          <div className="text-center bg-pink-100 rounded-xl px-4 py-2 ring-1 ring-pink-300">
            <p className="text-pink-600 font-bold">All breeds maxed!</p>
          </div>
        )}

        {/* Progress */}
        <MansionProgress progress={state.progress} />
      </div>

      {/* Drag overlay */}
      {dragState.isDragging && dragState.sourceIdx !== null && dragState.currentPos && state.grid[dragState.sourceIdx] && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: dragState.currentPos.x - 24,
            top: dragState.currentPos.y - 24,
          }}
        >
          <CatSprite cat={state.grid[dragState.sourceIdx]!} size="lg" />
        </div>
      )}
    </div>
  )
}
