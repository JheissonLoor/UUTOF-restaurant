import { useEffect, useState } from 'react'

import type { KitchenTicket, TicketStatus } from '@/types/api'

const emptyStats = {
  cooking: 0,
  newTickets: 0,
  ready: 0,
}

type TicketForStats = KitchenTicket & { estado_visual?: TicketStatus }

export function publishTopbarStats(tickets: TicketForStats[]): void {
  window.dispatchEvent(new CustomEvent('kds:stats', {
    detail: {
      cooking: tickets.filter((ticket) => (ticket.estado_visual ?? ticket.estado) === 'cooking' || (ticket.estado_visual ?? ticket.estado) === 'urgent').length,
      newTickets: tickets.filter((ticket) => (ticket.estado_visual ?? ticket.estado) === 'new').length,
      ready: tickets.filter((ticket) => (ticket.estado_visual ?? ticket.estado) === 'ready').length,
    },
  }))
}

export function useGlobalStats(): typeof emptyStats {
  const [stats, setStats] = useState(emptyStats)

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<typeof emptyStats>).detail
      setStats(detail ?? emptyStats)
    }
    window.addEventListener('kds:stats', handler)
    return () => window.removeEventListener('kds:stats', handler)
  }, [])

  return stats
}
