import { useEffect, useCallback, useState } from 'react'
import confetti from 'canvas-confetti'
import { useGame } from '../hooks/useGame'
import { MAX_GUESSES, type WordEntry } from '../lib/utils'
import type { GameMode } from './App'
import Grid from './Grid'
import Keyboard from './Keyboard'
import HintPanel from './HintPanel'
import GameOver from './GameOver'

interface GameProps {
  wordEntry: WordEntry
  mode: GameMode
  onSetBackground: (index: number) => void
}

export default function Game({ wordEntry, mode, onSetBackground }: GameProps) {
  const {
    todayWord,
    target,
    wordLength,
    guesses,
    currentGuess,
    gameStatus,
    evaluatedGuesses,
    shakeRow,
    revealedPositions,
    hintedPositions,
    allRevealedPositions,
    revealHintPosition,
    addLetter,
    deleteLetter,
    submitGuess,
    generateShareText,
    startRandomGame,
    elapsedSeconds,
  } = useGame(wordEntry, mode)

  const [showModal, setShowModal] = useState(false)

  // Fire confetti when game ends
  useEffect(() => {
    if (gameStatus === 'won') {
      const colors = ['#ff6b6b', '#ff9f43', '#feca57', '#48dbfb', '#0abde3', '#a78bfa', '#f472b6']
      confetti({ particleCount: 150, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
      confetti({ particleCount: 150, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
      setTimeout(() => {
        confetti({ particleCount: 100, angle: 80, spread: 60, origin: { x: 0.2, y: 0.6 }, colors })
        confetti({ particleCount: 100, angle: 100, spread: 60, origin: { x: 0.8, y: 0.6 }, colors })
      }, 300)
    } else if (gameStatus === 'lost') {
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 }, colors: ['#d8b4fe', '#e9d5ff', '#feca57', '#48dbfb'] })
    }
  }, [gameStatus])

  // Show modal after a delay when game ends
  useEffect(() => {
    if (gameStatus !== 'playing') {
      const timer = setTimeout(() => setShowModal(true), 1500)
      return () => clearTimeout(timer)
    } else {
      setShowModal(false)
    }
  }, [gameStatus])

  // Physical keyboard support
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Enter') {
        e.preventDefault()
        submitGuess()
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        deleteLetter()
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        addLetter(e.key)
      }
    },
    [submitGuess, deleteLetter, addLetter]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  function handleShare() {
    const text = generateShareText()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
    }
  }

  const gameOver = gameStatus !== 'playing'

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6 w-full">
      <Grid
        evaluatedGuesses={evaluatedGuesses}
        currentGuess={currentGuess}
        wordLength={wordLength}
        shakeRow={shakeRow}
        revealedPositions={revealedPositions}
        hintedPositions={hintedPositions}
        allRevealedPositions={allRevealedPositions}
        target={target}
        gameStatus={gameStatus}
      />

      <HintPanel
        word={todayWord}
        guessCount={guesses.length}
        gameOver={gameOver}
        elapsedSeconds={elapsedSeconds}
        target={target}
        revealedPositions={revealedPositions}
        onRevealPosition={revealHintPosition}
      />

      <Keyboard
        guesses={guesses}
        target={target}
        revealedPositions={allRevealedPositions}
        onKey={addLetter}
        onEnter={submitGuess}
        onDelete={deleteLetter}
      />

      {showModal && (
        <GameOver
          status={gameStatus}
          target={target}
          guessCount={guesses.length}
          maxGuesses={MAX_GUESSES}
          wordEntry={todayWord}
          onShare={handleShare}
          onRandomWord={startRandomGame}
          onCatClick={onSetBackground}
        />
      )}
    </div>
  )
}
