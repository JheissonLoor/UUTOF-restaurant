import { useEffect, useState } from 'react'

export function useElapsedTimer(createdAt: string, paused = false, initialElapsed = 0): number {
  const [elapsed, setElapsed] = useState(() => (paused ? initialElapsed : Math.max(initialElapsed, secondsSince(createdAt))))

  useEffect(() => {
    if (paused) {
      setElapsed(initialElapsed)
      return undefined
    }
    const tick = () => setElapsed(Math.max(initialElapsed, secondsSince(createdAt)))
    tick()
    const id = window.setInterval(tick, 1_000)
    return () => window.clearInterval(id)
  }, [createdAt, initialElapsed, paused])

  return elapsed
}

function secondsSince(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return 0
  return Math.max(0, Math.floor((Date.now() - created) / 1000))
}
