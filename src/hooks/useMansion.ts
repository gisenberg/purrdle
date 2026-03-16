import { useState, useEffect, useCallback } from 'react'
import {
  createInitialState,
  spawnCat,
  mergeCats,
  moveCat,
  loadMansionState,
  saveMansionState,
  type MansionState,
} from '../lib/mansion'

export function useMansion() {
  const [state, setState] = useState<MansionState>(
    () => loadMansionState() ?? createInitialState()
  )

  // Track recently merged cell for animation
  const [mergedCell, setMergedCell] = useState<number | null>(null)
  // Track recently spawned cell for animation
  const [spawnedCell, setSpawnedCell] = useState<number | null>(null)

  useEffect(() => {
    saveMansionState(state)
  }, [state])

  // Clear animation markers after animation plays
  useEffect(() => {
    if (mergedCell !== null) {
      const t = setTimeout(() => setMergedCell(null), 350)
      return () => clearTimeout(t)
    }
  }, [mergedCell])

  useEffect(() => {
    if (spawnedCell !== null) {
      const t = setTimeout(() => setSpawnedCell(null), 300)
      return () => clearTimeout(t)
    }
  }, [spawnedCell])

  const spawn = useCallback(() => {
    setState((prev) => {
      const next = spawnCat(prev)
      if (next === prev) return prev
      // Find which cell was spawned into
      for (let i = 0; i < next.grid.length; i++) {
        if (next.grid[i] !== null && prev.grid[i] === null) {
          setSpawnedCell(i)
          break
        }
      }
      return next
    })
  }, [])

  const merge = useCallback((fromIdx: number, toIdx: number) => {
    setState((prev) => {
      const next = mergeCats(prev, fromIdx, toIdx)
      if (next !== prev) setMergedCell(toIdx)
      return next
    })
  }, [])

  const move = useCallback((fromIdx: number, toIdx: number) => {
    setState((prev) => moveCat(prev, fromIdx, toIdx))
  }, [])

  const reset = useCallback(() => {
    setState(createInitialState())
    setMergedCell(null)
    setSpawnedCell(null)
  }, [])

  return { state, spawn, merge, move, reset, mergedCell, spawnedCell }
}
