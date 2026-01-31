import { useMemo } from 'react'
import type { GameStatus } from '../hooks/useGame'
import type { WordEntry } from '../lib/utils'
import { getRandomCatUrl } from './CatBackground'

const WIN_MESSAGES = [
  'Purr-fect!',
  'You\'re the cat\'s meow!',
  'Claw-some job!',
  'Feline fine!',
  'That was paws-itively brilliant!',
  'You\'re one smart kitty!',
  'Fur-bulous work!',
  'Meow-velous!',
  'You nailed it, whisker wizard!',
  'Cat-tastic!',
  'Hiss-tory in the making!',
  'Top cat!',
  'You\'re purr-fection!',
  'Fur real, nice work!',
  'Un-fur-gettable!',
  'Meow that\'s impressive!',
  'Tail-ented solver!',
  'Litter-ally amazing!',
  'You\'re a cat-ch!',
  'Whisker me impressed!',
]

const LOSE_MESSAGES = [
  'Maybe next time, kitten!',
  'Don\'t fur-get to try again!',
  'Every cat has its off day!',
  'Paws and try again!',
  'Not your luckiest life!',
  'Shake it off, kitty cat!',
  'Even cats miss the laser dot sometimes!',
  'Better luck next meow!',
  'That was a tough one, fur real!',
  'Time for a cat nap and a retry!',
]

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)]
}

interface GameOverProps {
  status: GameStatus
  target: string
  guessCount: number
  maxGuesses: number
  wordEntry: WordEntry
  onShare: () => void
  onRandomWord: () => void
}

export default function GameOver({
  status,
  target,
  guessCount,
  maxGuesses,
  wordEntry,
  onShare,
  onRandomWord,
}: GameOverProps) {
  const catUrl = useMemo(() => getRandomCatUrl(), [])
  const message = useMemo(
    () => (status === 'won' ? pickRandom(WIN_MESSAGES) : pickRandom(LOSE_MESSAGES)),
    [status]
  )

  if (status === 'playing') return null

  return (
    <div className="fixed inset-0 bg-pink-900/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-lg border border-pink-200">
        <img
          src={catUrl}
          alt="Cat"
          className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-pink-200 shadow-md"
        />
        <h2 className="text-2xl font-bold text-gray-800">
          {message}
        </h2>

        <p className="text-lg text-gray-700">
          The word was{' '}
          <span className="font-bold text-pink-500 uppercase">{target}</span>
        </p>

        {status === 'won' && (
          <p className="text-gray-500">
            Solved in {guessCount}/{maxGuesses} guesses
          </p>
        )}

        <div className="text-left space-y-1.5">
          {wordEntry.definitions.map((def, i) => (
            <p key={i} className="text-sm text-gray-600">
              {i + 1}. {def}
            </p>
          ))}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onShare}
            className="bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Share Results
          </button>
          <button
            onClick={onRandomWord}
            className="bg-violet-400 hover:bg-violet-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Random Word
          </button>
        </div>
      </div>
    </div>
  )
}
