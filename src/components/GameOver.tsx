import { useMemo } from 'react'
import type { GameStatus } from '../hooks/useGame'
import type { WordEntry } from '../lib/utils'
import { getRandomCatIndex, getCatImageUrl } from './CatBackground'

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
  'You\'re paws-itively genius!',
  'Meow-nificent work!',
  'Kitty-credible!',
  'You\'ve got cat-titude!',
  'Purr-haps you\'re a genius!',
  'That was im-paws-ible!',
  'Cat-egorically awesome!',
  'Fur-midable skills!',
  'You\'re a purr-fessional!',
  'Claw-ver kitty!',
  'Meow you\'re showing off!',
  'Paws-itively perfect!',
  'You\'re cat-ivating!',
  'Fur-tastic finish!',
  'You\'re meow-zing!',
  'Whisker-licking good!',
  'Cat got your victory!',
  'You\'re purr-ty smart!',
  'A-meow-zing job!',
  'You\'re the purr-oud winner!',
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
  'You\'ll get it next time, whiskers!',
  'Even the best cats land on their feet!',
  'Purr-haps try again?',
  'No worries, you\'re still purr-fect!',
  'That word was a fur-ocious challenge!',
  'You\'ve got 8 more lives left!',
  'Meow\'s a good time for another try!',
  'That was im-paws-ibly hard!',
  'Keep your whiskers up and try again!',
  'Curiosity didn\'t work this time, but try again!',
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
  onCatClick: (index: number) => void
}

export default function GameOver({
  status,
  target,
  guessCount,
  maxGuesses,
  wordEntry,
  onShare,
  onRandomWord,
  onCatClick,
}: GameOverProps) {
  const catIndex = useMemo(() => getRandomCatIndex(), [])
  const catUrl = getCatImageUrl(catIndex)
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
          className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-pink-200 shadow-md cursor-pointer hover:border-pink-400 transition-colors"
          onClick={() => onCatClick(catIndex)}
          title="Set as background"
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
