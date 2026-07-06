import { useEffect, useState } from 'react'

export function useElapsedTimer(createdAt: string, paused = false): number {
  const [elapsed, setElapsed] = useState(() => secondsSince(createdAt))

  useEffect(() => {
    if (paused) return undefined
    const tick = () => setElapsed(secondsSince(createdAt))
    tick()
    const id = window.setInterval(tick, 1_000)
    return () => window.clearInterval(id)
  }, [createdAt, paused])

  return elapsed
}

function secondsSince(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  if (Number.isNaN(created)) return 0
  return Math.max(0, Math.floor((Date.now() - created) / 1000))
}
