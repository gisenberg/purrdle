// --- Mellow's Mansion: Types, Constants & Pure Game Logic ---

export const BREEDS = [
  'ragdoll', 'orange-tabby', 'tuxedo', 'calico', 'siamese',
  'russian-blue', 'persian', 'scottish-fold', 'maine-coon', 'bengal',
] as const

export type Breed = typeof BREEDS[number]

export const BREED_LABELS: Record<Breed, string> = {
  'ragdoll': 'Ragdoll',
  'orange-tabby': 'Orange Tabby',
  'tuxedo': 'Tuxedo',
  'calico': 'Calico',
  'siamese': 'Siamese',
  'russian-blue': 'Russian Blue',
  'persian': 'Persian',
  'scottish-fold': 'Scottish Fold',
  'maine-coon': 'Maine Coon',
  'bengal': 'Bengal',
}

export const BREED_COLORS: Record<Breed, string> = {
  'ragdoll': 'bg-purple-300',
  'orange-tabby': 'bg-orange-300',
  'tuxedo': 'bg-gray-400',
  'calico': 'bg-amber-200',
  'siamese': 'bg-blue-200',
  'russian-blue': 'bg-slate-400',
  'persian': 'bg-yellow-200',
  'scottish-fold': 'bg-indigo-300',
  'maine-coon': 'bg-red-300',
  'bengal': 'bg-amber-400',
}

export const BREED_TEXT_COLORS: Record<Breed, string> = {
  'ragdoll': 'text-purple-800',
  'orange-tabby': 'text-orange-800',
  'tuxedo': 'text-gray-900',
  'calico': 'text-amber-800',
  'siamese': 'text-blue-800',
  'russian-blue': 'text-slate-900',
  'persian': 'text-yellow-800',
  'scottish-fold': 'text-indigo-800',
  'maine-coon': 'text-red-800',
  'bengal': 'text-amber-900',
}

export const BREED_INITIALS: Record<Breed, string> = {
  'ragdoll': 'R',
  'orange-tabby': 'T',
  'tuxedo': 'X',
  'calico': 'C',
  'siamese': 'S',
  'russian-blue': 'B',
  'persian': 'P',
  'scottish-fold': 'F',
  'maine-coon': 'M',
  'bengal': 'G',
}

export const MAX_TIER = 7
export const GRID_COLS = 9
export const GRID_ROWS = 7
export const GRID_SIZE = GRID_COLS * GRID_ROWS // 63

export interface CatToken {
  id: number
  breed: Breed
  tier: number // 1-7
}

export type Cell = CatToken | null
export type Grid = Cell[]
export type Progress = Record<Breed, number>

export interface MansionState {
  grid: Grid
  progress: Progress
  totalMerges: number
  nextId: number
}

// --- Pure functions ---

export function createEmptyGrid(): Grid {
  return new Array(GRID_SIZE).fill(null)
}

export function createInitialProgress(): Progress {
  const p = {} as Progress
  for (const b of BREEDS) p[b] = 0
  return p
}

export function createInitialState(): MansionState {
  const state: MansionState = {
    grid: createEmptyGrid(),
    progress: createInitialProgress(),
    totalMerges: 0,
    nextId: 1,
  }
  // Spawn 5 initial kittens
  let s = state
  for (let i = 0; i < 5; i++) s = spawnCat(s)
  return s
}

export function getEmptyCells(grid: Grid): number[] {
  const empty: number[] = []
  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === null) empty.push(i)
  }
  return empty
}

export function isBoardFull(grid: Grid): boolean {
  return grid.every((c) => c !== null)
}

export function spawnCat(state: MansionState): MansionState {
  const empty = getEmptyCells(state.grid)
  if (empty.length === 0) return state

  const cellIdx = empty[Math.floor(Math.random() * empty.length)]
  const breed = BREEDS[Math.floor(Math.random() * BREEDS.length)]
  const newGrid = [...state.grid]
  newGrid[cellIdx] = { id: state.nextId, breed, tier: 1 }

  return {
    ...state,
    grid: newGrid,
    nextId: state.nextId + 1,
  }
}

export function canMerge(grid: Grid, fromIdx: number, toIdx: number): boolean {
  if (fromIdx === toIdx) return false
  const a = grid[fromIdx]
  const b = grid[toIdx]
  if (!a || !b) return false
  return a.breed === b.breed && a.tier === b.tier && a.tier < MAX_TIER
}

export function mergeCats(state: MansionState, fromIdx: number, toIdx: number): MansionState {
  if (!canMerge(state.grid, fromIdx, toIdx)) return state

  const from = state.grid[fromIdx]!
  const newTier = from.tier + 1
  const newGrid = [...state.grid]
  newGrid[fromIdx] = null
  newGrid[toIdx] = { id: state.nextId, breed: from.breed, tier: newTier }

  const newProgress = { ...state.progress }
  if (newTier > newProgress[from.breed]) {
    newProgress[from.breed] = newTier
  }

  return {
    grid: newGrid,
    progress: newProgress,
    totalMerges: state.totalMerges + 1,
    nextId: state.nextId + 1,
  }
}

export function moveCat(state: MansionState, fromIdx: number, toIdx: number): MansionState {
  if (fromIdx === toIdx) return state
  if (!state.grid[fromIdx] || state.grid[toIdx] !== null) return state

  const newGrid = [...state.grid]
  newGrid[toIdx] = newGrid[fromIdx]
  newGrid[fromIdx] = null

  return { ...state, grid: newGrid }
}

export function getValidMergeTargets(grid: Grid, fromIdx: number): number[] {
  const cat = grid[fromIdx]
  if (!cat) return []
  const targets: number[] = []
  for (let i = 0; i < grid.length; i++) {
    if (i === fromIdx) continue
    const other = grid[i]
    if (other && other.breed === cat.breed && other.tier === cat.tier && cat.tier < MAX_TIER) {
      targets.push(i)
    }
  }
  return targets
}

export function getEmptyTargets(grid: Grid, fromIdx: number): number[] {
  const targets: number[] = []
  for (let i = 0; i < grid.length; i++) {
    if (i === fromIdx) continue
    if (grid[i] === null) targets.push(i)
  }
  return targets
}

export function isGameComplete(progress: Progress): boolean {
  return BREEDS.every((b) => progress[b] >= MAX_TIER)
}

export function getCellCoords(idx: number): { row: number; col: number } {
  return { row: Math.floor(idx / GRID_COLS), col: idx % GRID_COLS }
}

export function getCellIndex(row: number, col: number): number {
  return row * GRID_COLS + col
}

// --- Persistence ---

const STORAGE_KEY = 'purrdle-mansion'

export function loadMansionState(): MansionState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as MansionState
  } catch {
    return null
  }
}

export function saveMansionState(state: MansionState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}
