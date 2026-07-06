import { useCallback, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { getTicketsActivos } from '@/api/pedidos'
import { AlertIcon, CheckIcon, MaximizeIcon } from '@/components/icons'
import { Ticket } from '@/components/Ticket'
import { useWebSocket } from '@/realtime/useWebSocket'
import { publishTopbarStats } from '@/state/topbarStats'
import type { KitchenTicket, WSEvent } from '@/types/api'

export function KdsBoard(): JSX.Element {
  const ticketsQuery = useQuery({ queryKey: ['kds', 'tickets'], queryFn: getTicketsActivos, refetchInterval: 20_000 })

  const handleRealtimeEvent = useCallback((event: WSEvent) => {
    if (event.tipo.startsWith('pedido.')) {
      void ticketsQuery.refetch()
    }
  }, [ticketsQuery])

  const socketState = useWebSocket(handleRealtimeEvent)
  const tickets = useMemo(() => sortTickets(ticketsQuery.data ?? []), [ticketsQuery.data])
  const counts = useMemo(() => ({
    active: tickets.length,
    newTickets: tickets.filter((ticket) => ticket.estado === 'new').length,
    cooking: tickets.filter((ticket) => ticket.estado === 'cooking').length,
    urgent: tickets.filter((ticket) => ticket.estado === 'urgent').length,
    ready: tickets.filter((ticket) => ticket.estado === 'ready').length,
  }), [tickets])

  useEffect(() => {
    publishTopbarStats(tickets)
  }, [tickets])

  async function enterFullscreen(): Promise<void> {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    }
  }

  return (
    <>
      <section className="flex items-center gap-2 border-b border-white/[0.08] bg-bg-2 px-[22px] py-3">
        <FilterPill label="Activos" count={counts.active} active />
        <FilterPill label="Nuevos" count={counts.newTickets} />
        <FilterPill label="Cocinando" count={counts.cooking} />
        <FilterPill label="Urgentes" count={counts.urgent} icon={<AlertIcon size={13} />} />
        <FilterPill label="Listos" count={counts.ready} icon={<CheckIcon size={13} />} />
        <div className="flex-1" />
        {socketState !== 'open' ? <span className="rounded-sm border border-danger/50 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">Reconectando...</span> : null}
        <div className="flex rounded-sm border border-white/[0.08] bg-surface p-1">
          <button type="button" className="rounded-[7px] bg-bg px-3 py-1.5 text-xs font-semibold text-ink">Tarjetas</button>
          <button type="button" className="px-3 py-1.5 text-xs font-semibold text-ink-3" disabled>Lista</button>
        </div>
        <button type="button" onClick={() => void enterFullscreen()} className="grid h-9 w-9 place-items-center rounded-sm border border-white/[0.16] text-ink-3 transition hover:text-ink" aria-label="Pantalla completa">
          <MaximizeIcon size={15} />
        </button>
      </section>

      <main className="min-h-0 overflow-auto px-[22px] py-4">
        {ticketsQuery.isLoading ? <TicketSkeletonGrid /> : null}
        {ticketsQuery.isError ? <BoardMessage tone="error" title="No se pudieron cargar los tickets" detail="Verifica que el backend y MySQL estén activos." /> : null}
        {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length === 0 ? <BoardMessage tone="empty" title="Todo tranquilo" detail="Sin tickets pendientes en cocina." /> : null}
        {!ticketsQuery.isLoading && !ticketsQuery.isError && tickets.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] content-start gap-3.5">
            {tickets.map((ticket) => <Ticket key={ticket.id_pedido} ticket={ticket} />)}
          </div>
        ) : null}
      </main>

      <footer className="flex items-center gap-4 border-t border-white/[0.08] bg-bg-2 px-[22px] text-[12.5px] text-ink-3">
        <Legend color="#F5C04A" label="Nuevo" />
        <Legend color="#F26B53" label="Cocinando" />
        <Legend color="#FF5C42" label="Urgente" />
        <Legend color="#5BD4B0" label="Listo" />
        <div className="flex-1" />
        <span className="rounded-full border border-white/[0.08] bg-surface px-3 py-1">Tiempo prom: <b className="text-ink tnum">18 min</b></span>
        <span className="rounded-full border border-white/[0.08] bg-surface px-3 py-1">Modo: <b className="text-ink">Premium</b></span>
      </footer>
    </>
  )
}

function FilterPill({ label, count, active = false, icon }: { label: string; count: number; active?: boolean; icon?: JSX.Element }): JSX.Element {
  return (
    <button
      type="button"
      disabled={!active}
      className={`inline-flex items-center gap-2 rounded-[11px] border px-4 py-2 text-[13px] font-medium ${active ? 'border-coral bg-coral/10 text-coral' : 'border-white/[0.08] bg-surface text-ink-2'}`}
    >
      {icon}
      {label}
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold tnum ${active ? 'bg-coral text-white' : 'bg-bg text-ink'}`}>{count}</span>
    </button>
  )
}

function TicketSkeletonGrid(): JSX.Element {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3.5">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="min-h-[260px] animate-pulse rounded-[16px] border border-white/[0.08] bg-surface">
          <div className="h-1.5 rounded-t-[16px] bg-white/[0.08]" />
          <div className="space-y-4 p-4">
            <div className="h-7 w-24 rounded-sm bg-white/[0.08]" />
            <div className="h-4 w-full rounded-sm bg-white/[0.08]" />
            <div className="h-4 w-2/3 rounded-sm bg-white/[0.08]" />
            <div className="h-20 rounded-sm bg-white/[0.08]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function BoardMessage({ tone, title, detail }: { tone: 'empty' | 'error'; title: string; detail: string }): JSX.Element {
  return (
    <div className={`grid min-h-full place-items-center rounded-lg border ${tone === 'error' ? 'border-danger/40 bg-danger/10 text-danger' : 'border-white/[0.08] bg-surface text-ink'}`}>
      <div className="text-center">
        <div className="font-serif text-[30px] font-semibold">{title}</div>
        <p className="mt-2 text-sm text-ink-3">{detail}</p>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }): JSX.Element {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function sortTickets(tickets: KitchenTicket[]): KitchenTicket[] {
  const rank: Record<KitchenTicket['estado'], number> = {
    urgent: 0,
    new: 1,
    cooking: 2,
    ready: 3,
  }
  return [...tickets].sort((a, b) => rank[a.estado] - rank[b.estado] || a.id_pedido - b.id_pedido)
}
