import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import {
  getUnlockedHintCount,
  censorWord,
  getLetterHints,
  getLetterHintThreshold,
  getUnlockedLetterHintCount,
  type WordEntry,
} from '../lib/utils'

interface HintPanelProps {
  word: WordEntry
  guessCount: number
  gameOver: boolean
  elapsedSeconds: number
  target: string
  revealedPositions: Set<number>
  onRevealPosition: (pos: number) => void
}

const HINT_THRESHOLDS = [0, 30, 60] // seconds until hint 1, 2, 3 unlock

export default function HintPanel({
  word,
  guessCount,
  gameOver,
  elapsedSeconds,
  target,
  revealedPositions,
  onRevealPosition,
}: HintPanelProps) {
  const timerDefCount = getUnlockedHintCount(guessCount, gameOver, elapsedSeconds)
  const definitions = word.definitions

  const letterHints = useMemo(
    () => getLetterHints(target, revealedPositions),
    [target, revealedPositions]
  )

  const timerLetterCount = getUnlockedLetterHintCount(gameOver, elapsedSeconds, letterHints.length)

  // Manual overrides (user clicked "Reveal")
  const [manualDefCount, setManualDefCount] = useState(0)
  const [manualLetterCount, setManualLetterCount] = useState(0)
  const [viewingHint, setViewingHint] = useState(0)

  const defUnlockedCount = Math.max(timerDefCount, manualDefCount)
  const letterUnlockedCount = Math.min(
    Math.max(timerLetterCount, manualLetterCount),
    letterHints.length
  )

  const prevLetterUnlockedRef = useRef(letterUnlockedCount)
  const prevDefUnlockedRef = useRef(defUnlockedCount)

  // Reveal hinted positions on the board when letter hints unlock
  useEffect(() => {
    if (letterUnlockedCount > prevLetterUnlockedRef.current) {
      for (let i = prevLetterUnlockedRef.current; i < letterUnlockedCount; i++) {
        const hint = letterHints[i]
        if (hint) {
          onRevealPosition(hint.position)
        }
      }
    }
    prevLetterUnlockedRef.current = letterUnlockedCount
  }, [letterUnlockedCount, letterHints, onRevealPosition])

  // Auto-advance to the newest hint when a new one unlocks
  useEffect(() => {
    if (defUnlockedCount > prevDefUnlockedRef.current) {
      setViewingHint(defUnlockedCount - 1)
    }
    prevDefUnlockedRef.current = defUnlockedCount
  }, [defUnlockedCount])

  const revealNextDef = useCallback(() => {
    setManualDefCount(Math.min(defUnlockedCount + 1, 3))
  }, [defUnlockedCount])

  const revealNextLetter = useCallback(() => {
    setManualLetterCount(Math.min(letterUnlockedCount + 1, letterHints.length))
  }, [letterUnlockedCount, letterHints.length])

  const hasMoreLetterHints = letterUnlockedCount < letterHints.length

  // Hint text for the currently viewed hint
  const hintText = (() => {
    const text = definitions[viewingHint]
    if (!text) return `${viewingHint + 1}. ???`
    const censored = gameOver ? text : censorWord(text, word.word)
    return `${viewingHint + 1}. ${censored}`
  })()

  // Progress bar for the next locked hint
  const nextLockedIdx = defUnlockedCount
  const showDefProgress = nextLockedIdx < 3 && nextLockedIdx > 0
  const defProgress = (() => {
    if (!showDefProgress) return 0
    const threshold = HINT_THRESHOLDS[nextLockedIdx] ?? 0
    const prev = HINT_THRESHOLDS[nextLockedIdx - 1] ?? 0
    if (threshold <= prev) return 0
    return Math.min(Math.max(elapsedSeconds - prev, 0) / (threshold - prev), 1)
  })()

  // Can the user manually reveal the next definition?
  const canRevealNextDef = !gameOver && defUnlockedCount < 3

  // Cycle through unlocked hints on tap
  const cycleHint = useCallback(() => {
    if (defUnlockedCount <= 1) return
    setViewingHint((prev) => (prev + 1) % defUnlockedCount)
  }, [defUnlockedCount])

  return (
    <div className="w-full max-w-sm mx-auto space-y-2 px-4">
      {/* Single hint card */}
      <div
        className="text-sm rounded-lg px-3 py-2 bg-white border border-pink-200 text-gray-700 relative overflow-hidden cursor-pointer select-none"
        onClick={cycleHint}
      >
        <span className="flex items-center justify-between gap-2">
          <span className="leading-snug">{hintText}</span>
          {canRevealNextDef && (
            <button
              onClick={(e) => { e.stopPropagation(); revealNextDef() }}
              className="text-xs text-pink-400 hover:text-pink-500 font-semibold shrink-0 transition-colors"
            >
              +hint
            </button>
          )}
        </span>
        {/* Dot indicators */}
        {defUnlockedCount > 1 && (
          <div className="flex justify-center gap-1.5 mt-1.5">
            {Array.from({ length: defUnlockedCount }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === viewingHint ? 'bg-pink-400' : 'bg-pink-200'
                }`}
              />
            ))}
            {defUnlockedCount < 3 && (
              <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
            )}
          </div>
        )}
        {/* Progress bar for next definition hint */}
        {showDefProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-100">
            <div
              className="h-full bg-pink-400 transition-all duration-1000 ease-linear"
              style={{ width: `${defProgress * 100}%` }}
            />
          </div>
        )}
      </div>
      {/* Reveal a letter button */}
      {!gameOver && hasMoreLetterHints && (() => {
        const nextLetterIdx = letterUnlockedCount
        const threshold = getLetterHintThreshold(nextLetterIdx)
        const prevThreshold = nextLetterIdx === 0 ? 60 : getLetterHintThreshold(nextLetterIdx - 1)
        const showProgress = defUnlockedCount >= 3 && elapsedSeconds < threshold
        const progress = showProgress
          ? Math.min(Math.max(elapsedSeconds - prevThreshold, 0) / (threshold - prevThreshold), 1)
          : 0
        return (
          <button
            onClick={revealNextLetter}
            className="w-full text-sm text-pink-400 hover:text-pink-500 font-semibold py-1.5 rounded-lg border border-pink-200 bg-white/60 hover:bg-white transition-colors relative overflow-hidden"
          >
            Reveal a letter
            {showProgress && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-100">
                <div
                  className="h-full bg-pink-400 transition-all duration-1000 ease-linear"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            )}
          </button>
        )
      })()}
      {gameOver && word.example && (
        <div className="text-xs text-gray-400 italic px-1">
          "{word.example}"
        </div>
      )}
    </div>
  )
}
