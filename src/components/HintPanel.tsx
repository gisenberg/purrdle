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

  const defUnlockedCount = Math.max(timerDefCount, manualDefCount)
  const letterUnlockedCount = Math.min(
    Math.max(timerLetterCount, manualLetterCount),
    letterHints.length
  )

  const totalSlots = 3 + letterHints.length

  const prevLetterUnlockedRef = useRef(letterUnlockedCount)

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

  const revealNextDef = useCallback(() => {
    setManualDefCount(Math.min(defUnlockedCount + 1, 3))
  }, [defUnlockedCount])

  const revealNextLetter = useCallback(() => {
    setManualLetterCount(Math.min(letterUnlockedCount + 1, letterHints.length))
  }, [letterUnlockedCount, letterHints.length])

  const hasMoreLetterHints = letterUnlockedCount < letterHints.length

  return (
    <div className="w-full max-w-sm mx-auto space-y-2 px-4">
      <h3 className="text-sm font-semibold text-pink-400 uppercase tracking-wide flex items-center gap-1.5">
        <span role="img" aria-label="paw">🐾</span> Hints
      </h3>
      {Array.from({ length: totalSlots }, (_, i) => {
        const isDefinitionSlot = i < 3
        const unlocked = isDefinitionSlot ? i < defUnlockedCount : (i - 3) < letterUnlockedCount
        // Compute threshold and progress
        let threshold: number
        let prevThreshold: number
        if (isDefinitionSlot) {
          threshold = HINT_THRESHOLDS[i] ?? 0
          prevThreshold = HINT_THRESHOLDS[i - 1] ?? 0
        } else {
          const letterIdx = i - 3
          threshold = getLetterHintThreshold(letterIdx)
          prevThreshold = letterIdx === 0 ? 60 : getLetterHintThreshold(letterIdx - 1)
        }

        // Show progress bar for the next locked hint (only one at a time)
        const showProgress = threshold > 0 && !unlocked && (() => {
          if (isDefinitionSlot) {
            return i < defUnlockedCount + 1
          } else {
            // Only show letter hint progress if all 3 definitions are unlocked
            if (defUnlockedCount < 3) return false
            const letterIdx = i - 3
            return letterIdx < letterUnlockedCount + 1
          }
        })()

        const progress = showProgress
          ? Math.min(Math.max(elapsedSeconds - prevThreshold, 0) / (threshold - prevThreshold), 1)
          : 0

        // Should we show a reveal button on this slot?
        const showRevealButton = !gameOver && !unlocked && isDefinitionSlot && i > 0 && i <= defUnlockedCount

        if (isDefinitionSlot) {
          const text = definitions[i]
          return (
            <div key={i} className="hint-card">
              <div className={`hint-card-inner ${unlocked && i > 0 ? 'flipped' : ''}`}>
                <div
                  className={`hint-card-front text-sm rounded-lg px-3 py-2 relative overflow-hidden ${
                    i === 0
                      ? 'bg-white border border-pink-200 text-gray-700'
                      : 'bg-white/60 border border-pink-100 text-gray-400'
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span>
                      {i === 0 && text
                        ? `1. ${gameOver ? text : censorWord(text, word.word)}`
                        : `${i + 1}. ???`}
                    </span>
                    {showRevealButton && (
                      <button
                        onClick={revealNextDef}
                        className="text-xs text-pink-400 hover:text-pink-500 font-semibold shrink-0 transition-colors"
                      >
                        Reveal
                      </button>
                    )}
                  </span>
                  {showProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-100">
                      <div
                        className="h-full bg-pink-400 transition-all duration-1000 ease-linear"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                {i > 0 && (
                  <div className="hint-card-back text-sm rounded-lg px-3 py-2 bg-white border border-pink-200 text-gray-700">
                    {text
                      ? `${i + 1}. ${gameOver ? text : censorWord(text, word.word)}`
                      : `${i + 1}. ???`}
                  </div>
                )}
              </div>
            </div>
          )
        } else {
          // Letter hint slot
          const letterIdx = i - 3
          const hint = letterHints[letterIdx]
          return (
            <div key={i} className="hint-card">
              <div className={`hint-card-inner ${unlocked ? 'flipped' : ''}`}>
                <div className="hint-card-front text-sm rounded-lg px-3 py-2 relative overflow-hidden bg-white/60 border border-pink-100 text-gray-400">
                  🔤 ???
                  {showProgress && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-100">
                      <div
                        className="h-full bg-pink-400 transition-all duration-1000 ease-linear"
                        style={{ width: `${progress * 100}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="hint-card-back text-sm rounded-lg px-3 py-2 bg-white border border-pink-200 text-gray-700">
                  {hint
                    ? `Letter ${hint.inputIndex}: ${hint.letter}`
                    : '🔤 ???'}
                </div>
              </div>
            </div>
          )
        }
      })}
      {!gameOver && hasMoreLetterHints && (
        <button
          onClick={revealNextLetter}
          className="w-full text-sm text-pink-400 hover:text-pink-500 font-semibold py-1.5 rounded-lg border border-pink-200 bg-white/60 hover:bg-white transition-colors"
        >
          Reveal a letter
        </button>
      )}
      {gameOver && word.example && (
        <div className="text-xs text-gray-400 italic px-1">
          "{word.example}"
        </div>
      )}
    </div>
  )
}
