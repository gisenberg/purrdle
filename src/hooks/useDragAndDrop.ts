import { useState, useCallback, useRef } from 'react'
import { getValidMergeTargets, type Grid } from '../lib/mansion'

export interface DragState {
  isDragging: boolean
  sourceIdx: number | null
  currentPos: { x: number; y: number } | null
  hoverIdx: number | null
  validTargets: Set<number>
}

const INITIAL_DRAG: DragState = {
  isDragging: false,
  sourceIdx: null,
  currentPos: null,
  hoverIdx: null,
  validTargets: new Set(),
}

function getCellIdxFromPoint(x: number, y: number, gridEl: HTMLElement | null): number | null {
  if (!gridEl) return null
  const els = document.elementsFromPoint(x, y)
  for (const el of els) {
    const attr = (el as HTMLElement).dataset?.cellIdx
    if (attr !== undefined) {
      return parseInt(attr, 10)
    }
  }
  return null
}

export function useDragAndDrop(
  gridRef: React.RefObject<HTMLDivElement | null>,
  grid: Grid,
  onMerge: (from: number, to: number) => void,
  onMove: (from: number, to: number) => void,
) {
  const [dragState, setDragState] = useState<DragState>(INITIAL_DRAG)
  const dragRef = useRef<DragState>(INITIAL_DRAG)
  const gridSnapshotRef = useRef<Grid>(grid)

  // Keep grid snapshot current for event handlers
  gridSnapshotRef.current = grid

  const onPointerDown = useCallback(
    (idx: number, e: React.PointerEvent) => {
      const cat = gridSnapshotRef.current[idx]
      if (!cat) return

      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

      const targets = new Set(getValidMergeTargets(gridSnapshotRef.current, idx))
      const state: DragState = {
        isDragging: true,
        sourceIdx: idx,
        currentPos: { x: e.clientX, y: e.clientY },
        hoverIdx: null,
        validTargets: targets,
      }
      dragRef.current = state
      setDragState(state)
    },
    []
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.isDragging) return
      e.preventDefault()

      const pos = { x: e.clientX, y: e.clientY }
      const hoverIdx = getCellIdxFromPoint(e.clientX, e.clientY, gridRef.current)

      const state: DragState = {
        ...dragRef.current,
        currentPos: pos,
        hoverIdx: hoverIdx !== dragRef.current.sourceIdx ? hoverIdx : null,
      }
      dragRef.current = state
      setDragState(state)
    },
    [gridRef]
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.isDragging) return
      e.preventDefault()
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)

      const { sourceIdx, hoverIdx, validTargets } = dragRef.current
      if (sourceIdx !== null && hoverIdx !== null) {
        if (validTargets.has(hoverIdx)) {
          onMerge(sourceIdx, hoverIdx)
        } else if (gridSnapshotRef.current[hoverIdx] === null) {
          onMove(sourceIdx, hoverIdx)
        }
      }

      dragRef.current = INITIAL_DRAG
      setDragState(INITIAL_DRAG)
    },
    [onMerge, onMove]
  )

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current.isDragging) return
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      dragRef.current = INITIAL_DRAG
      setDragState(INITIAL_DRAG)
    },
    []
  )

  return {
    dragState,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  }
}
