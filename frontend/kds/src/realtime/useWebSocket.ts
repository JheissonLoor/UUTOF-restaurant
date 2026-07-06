import { useEffect, useRef, useState } from 'react'

import { WS_BASE_URL } from '@/api/client'
import { getAccessToken } from '@/auth/session'
import type { WSEvent } from '@/types/api'

type ConnectionState = 'connecting' | 'open' | 'closed' | 'error'

export function useWebSocket(onEvent: (event: WSEvent) => void): ConnectionState {
  const [state, setState] = useState<ConnectionState>('connecting')
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    let socket: WebSocket | null = null
    let reconnectTimer: number | undefined
    let cancelled = false
    let attempt = 0

    function connect(): void {
      const token = getAccessToken()
      if (!token) {
        setState('closed')
        return
      }

      setState('connecting')
      socket = new WebSocket(`${WS_BASE_URL}?token=${encodeURIComponent(token)}`)

      socket.onopen = () => {
        attempt = 0
        setState('open')
      }

      socket.onmessage = (message) => {
        try {
          const parsed = JSON.parse(message.data) as WSEvent
          onEventRef.current(parsed)
        } catch {
          // El websocket puede enviar mensajes externos; se ignoran si no son JSON del KDS.
        }
      }

      socket.onerror = () => {
        setState('error')
      }

      socket.onclose = () => {
        if (cancelled) return
        setState('closed')
        attempt += 1
        const delay = Math.min(1_000 * attempt, 8_000)
        reconnectTimer = window.setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [])

  return state
}
