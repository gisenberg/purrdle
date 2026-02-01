import { useState, useEffect, useSyncExternalStore } from 'react'
import Game from './Game'
import CatBackground, { useCatBackground } from './CatBackground'
import {
  getTodayWord,
  getRandomWord,
  encodeWordId,
  getWordIndex,
  decodeWordId,
  getWordByIndex,
  type WordEntry,
} from '../lib/utils'

export type GameMode = 'daily' | 'random' | 'specific'

interface RouteState {
  mode: GameMode
  wordEntry: WordEntry
}

function parseHash(): RouteState {
  const hash = window.location.hash.replace(/^#\/?/, '')

  if (hash === 'random') {
    const entry = getRandomWord()
    const id = encodeWordId(getWordIndex(entry))
    window.location.replace(`#/w/${id}`)
    return { mode: 'random', wordEntry: entry }
  }

  if (hash.startsWith('w/')) {
    const id = hash.slice(2)
    const index = decodeWordId(id)
    if (index !== null) {
      const entry = getWordByIndex(index)
      if (entry) {
        return { mode: 'specific', wordEntry: entry }
      }
    }
    // Invalid ID — fall through to daily
  }

  return { mode: 'daily', wordEntry: getTodayWord() }
}

function subscribeToHash(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getHashSnapshot() {
  return window.location.hash
}

export default function App() {
  const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot)
  const [route, setRoute] = useState<RouteState>(parseHash)
  const bg = useCatBackground()

  useEffect(() => {
    setRoute(parseHash())
  }, [hash])

  return (
    <div className="min-h-screen bg-purple-50 text-gray-800 flex flex-col paw-bg relative">
      <CatBackground current={bg.current} fading={bg.fading} />
      <header className="border-b border-pink-200 py-1.5 sm:py-2 px-3 bg-white/60 relative z-10">
        <div className="flex items-center justify-between">
          <div className="w-16 sm:w-20" />
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider flex items-center gap-1">
              <span className="text-base sm:text-lg" role="img" aria-label="cat">🐱</span>
              <a href="#/" className="hover:opacity-80 transition-opacity">
                <span className="text-pink-500">P</span>URRDLE
              </a>
            </h1>
            <a
              href="#/random"
              className="text-xs text-violet-500 hover:text-violet-400 transition-colors"
            >
              random
            </a>
          </div>
          <div className="flex items-center gap-0.5 w-16 sm:w-20 justify-end">
            <button
              onClick={bg.prev}
              className="text-pink-400 hover:text-pink-500 transition-colors p-0.5"
              aria-label="Previous cat photo"
              title="Previous"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              onClick={bg.togglePause}
              className="text-pink-400 hover:text-pink-500 transition-colors p-0.5"
              aria-label={bg.paused ? 'Play slideshow' : 'Pause slideshow'}
              title={bg.paused ? 'Play' : 'Pause'}
            >
              {bg.paused ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                  <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
              )}
            </button>
            <button
              onClick={bg.next}
              className="text-pink-400 hover:text-pink-500 transition-colors p-0.5"
              aria-label="Next cat photo"
              title="Next"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 sm:w-4 sm:h-4">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex flex-col items-center py-2 sm:py-3 px-2 relative z-10">
        <Game key={route.wordEntry.word} wordEntry={route.wordEntry} mode={route.mode} onSetBackground={bg.goTo} />
      </main>
    </div>
  )
}
