import { useState, useEffect, useCallback, useRef } from 'react'

const RAGDOLL_COUNT = 31
const GENERAL_COUNT = 100
const TOTAL = RAGDOLL_COUNT + GENERAL_COUNT
const ROTATE_INTERVAL = 45_000
const FADE_DURATION = 2000

function getImageUrl(index: number): string {
  const base = import.meta.env.BASE_URL
  if (index < RAGDOLL_COUNT) {
    return `${base}cats/ragdoll/${index + 1}.jpg`
  }
  return `${base}cats/photos/${index - RAGDOLL_COUNT + 1}.jpg`
}

function randomIndex(exclude?: number): number {
  let n: number
  do {
    n = Math.floor(Math.random() * TOTAL)
  } while (n === exclude)
  return n
}

export function useCatBackground() {
  const [current, setCurrent] = useState(() => randomIndex())
  const [fading, setFading] = useState(false)
  const [paused, setPaused] = useState(false)
  const historyRef = useRef<number[]>([current])
  const historyPosRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const advance = useCallback((next: number) => {
    setFading(true)
    setTimeout(() => {
      setCurrent(next)
      historyRef.current = [...historyRef.current.slice(0, historyPosRef.current + 1), next]
      historyPosRef.current = historyRef.current.length - 1
      setFading(false)
    }, FADE_DURATION)
  }, [])

  const startTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const prev = historyRef.current[historyPosRef.current]
      advance(randomIndex(prev))
    }, ROTATE_INTERVAL)
  }, [advance])

  useEffect(() => {
    if (!paused) startTimer()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, startTimer])

  const next = useCallback(() => {
    if (fading) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (historyPosRef.current < historyRef.current.length - 1) {
      historyPosRef.current++
      setFading(true)
      setTimeout(() => {
        setCurrent(historyRef.current[historyPosRef.current])
        setFading(false)
      }, FADE_DURATION)
    } else {
      const prev = historyRef.current[historyPosRef.current]
      advance(randomIndex(prev))
    }
    if (!paused) startTimer()
  }, [fading, paused, advance, startTimer])

  const prev = useCallback(() => {
    if (fading) return
    if (historyPosRef.current <= 0) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    historyPosRef.current--
    setFading(true)
    setTimeout(() => {
      setCurrent(historyRef.current[historyPosRef.current])
      setFading(false)
    }, FADE_DURATION)
    if (!paused) startTimer()
  }, [fading, paused, startTimer])

  const togglePause = useCallback(() => {
    setPaused((p) => !p)
  }, [])

  return { current, fading, paused, next, prev, togglePause }
}

interface CatBackgroundProps {
  current: number
  fading: boolean
}

export default function CatBackground({ current, fading }: CatBackgroundProps) {
  return (
    <div
      className="ragdoll-bg"
      style={{ backgroundImage: `url(${getImageUrl(current)})`, opacity: fading ? 0 : 1 }}
    />
  )
}

export function getRandomCatUrl(): string {
  return getImageUrl(randomIndex())
}
