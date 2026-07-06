import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { avanzarEstado, getTicketsActivos, marcarItem, pausarTicket, reportarInsumo } from '@/api/pedidos'
import { FilterTabs } from '@/components/FilterTabs'
import { Footer } from '@/components/Footer'
import { FullscreenButton } from '@/components/FullscreenButton'
import { Ticket } from '@/components/Ticket'
import { ViewToggle } from '@/components/ViewToggle'
import { ReportarInsumoModal } from '@/components/modals/ReportarInsumoModal'
import { BoardMessage, TicketSkeletonGrid } from '@/components/ui/BoardStates'
import { useNowTick } from '@/hooks/useNowTick'
import { filterTickets, playDing, sortTickets, withRuntime, type RuntimeTicket } from '@/lib/tickets'
import { useWebSocket } from '@/realtime/useWebSocket'
import { publishTopbarStats } from '@/state/topbarStats'
import type { FilterId, KitchenTicket, ViewMode, WSEvent } from '@/types/api'

interface KdsBoardProps {
  soundEnabled: boolean
}

export function KdsBoard({ soundEnabled }: KdsBoardProps): JSX.Element {
  const queryClient = useQueryClient()
  const nowMs = useNowTick()
  const [filter, setFilter] = useState<FilterId>('activos')
  const [view, setView] = useState<ViewMode>('cards')
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set())
  const [reportTicket, setReportTicket] = useState<RuntimeTicket | null>(null)

  const ticketsQuery = useQuery({ queryKey: ['kds', 'tickets'], queryFn: getTicketsActivos, refetchInterval: 20_000 })

  const replaceTicket = useCallback((ticket: KitchenTicket) => {
    queryClient.setQueryData<KitchenTicket[]>(['kds', 'tickets'], (current = []) => {
      const exists = current.some((item) => item.id_pedido === ticket.id_pedido)
      return exists ? current.map((item) => item.id_pedido === ticket.id_pedido ? ticket : item) : [ticket, ...current]
    })
  }, [queryClient])

  const markItemMutation = useMutation({
    mutationFn: ({ idPedido, idDetalle, listo }: { idPedido: number; idDetalle: number; listo: boolean }) => marcarItem(idPedido, idDetalle, listo),
    onSuccess: (ticket) => {
      replaceTicket(ticket)
      if (ticket.estado === 'ready') playDing(soundEnabled)
    },
  })

  const advanceMutation = useMutation({
    mutationFn: ({ idPedido, transicion }: { idPedido: number; transicion: 'marcarListo' | 'entregar' }) => avanzarEstado(idPedido, transicion),
    onSuccess: (ticket, variables) => {
      if (variables.transicion === 'entregar') {
        queryClient.setQueryData<KitchenTicket[]>(['kds', 'tickets'], (current = []) => current.filter((item) => item.id_pedido !== ticket.id_pedido))
      } else {
        replaceTicket(ticket)
        playDing(soundEnabled)
      }
    },
  })

  const pauseMutation = useMutation({
    mutationFn: ({ idPedido, pausado }: { idPedido: number; pausado: boolean }) => pausarTicket(idPedido, pausado),
    onSuccess: replaceTicket,
  })

  const reportMutation = useMutation({
    mutationFn: ({ idPedido, idDetalle, nota }: { idPedido: number; idDetalle: number; nota: string }) => reportarInsumo(idPedido, idDetalle, nota),
    onSuccess: (_, variables) => {
      queryClient.setQueryData<KitchenTicket[]>(['kds', 'tickets'], (current = []) => current.map((ticket) => ticket.id_pedido === variables.idPedido ? { ...ticket, alerta_insumo: true } : ticket))
      playDing(soundEnabled)
    },
  })

  const handleRealtimeEvent = useCallback((event: WSEvent) => {
    if (!event.tipo.startsWith('pedido.') && event.tipo !== 'insumo.alerta') return
    const idPedido = typeof event.id_pedido === 'number' ? event.id_pedido : undefined
    if (idPedido !== undefined) {
      setHighlightedIds((current) => new Set(current).add(idPedido))
      window.setTimeout(() => {
        setHighlightedIds((current) => {
          const next = new Set(current)
          next.delete(idPedido)
          return next
        })
      }, 1500)
    }
    if (event.tipo === 'pedido.creado') playDing(soundEnabled)
    void ticketsQuery.refetch()
  }, [soundEnabled, ticketsQuery])

  const socketState = useWebSocket(handleRealtimeEvent)
  const runtimeTickets = useMemo(() => sortTickets((ticketsQuery.data ?? []).map((ticket) => withRuntime(ticket, nowMs))), [nowMs, ticketsQuery.data])
  const visibleTickets = useMemo(() => filterTickets(runtimeTickets, filter), [filter, runtimeTickets])
  const counts = useMemo<Record<FilterId, number>>(() => ({
    activos: runtimeTickets.length,
    new: runtimeTickets.filter((ticket) => ticket.estado_visual === 'new').length,
    cooking: runtimeTickets.filter((ticket) => ticket.estado_visual === 'cooking').length,
    urgent: runtimeTickets.filter((ticket) => ticket.estado_visual === 'urgent').length,
    ready: runtimeTickets.filter((ticket) => ticket.estado_visual === 'ready').length,
  }), [runtimeTickets])

  useEffect(() => {
    publishTopbarStats(runtimeTickets)
  }, [runtimeTickets])

  const busyPedidoIds = new Set<number>([
    markItemMutation.variables?.idPedido,
    advanceMutation.variables?.idPedido,
    pauseMutation.variables?.idPedido,
  ].filter((id): id is number => typeof id === 'number'))

  return (
    <>
      <section className="flex items-center gap-2 border-b border-white/[0.08] bg-bg-2 px-[22px] py-3">
        <FilterTabs active={filter} counts={counts} onChange={setFilter} />
        <div className="flex-1" />
        {socketState !== 'open' ? <span className="rounded-sm border border-danger/50 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger">Reconectando...</span> : null}
        <ViewToggle value={view} onChange={setView} />
        <FullscreenButton />
      </section>

      <main className="min-h-0 overflow-auto px-[22px] py-4">
        {ticketsQuery.isLoading ? <TicketSkeletonGrid /> : null}
        {ticketsQuery.isError ? <BoardMessage tone="error" title="No se pudieron cargar los tickets" detail="Verifica que el backend y MySQL estén activos." /> : null}
        {!ticketsQuery.isLoading && !ticketsQuery.isError && visibleTickets.length === 0 ? <BoardMessage tone="empty" title="Todo tranquilo" detail="Sin tickets pendientes para este filtro." /> : null}
        {!ticketsQuery.isLoading && !ticketsQuery.isError && visibleTickets.length > 0 ? (
          <div className={view === 'cards' ? 'grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] content-start gap-3.5' : 'grid grid-cols-1 content-start gap-2.5'}>
            {visibleTickets.map((ticket) => (
              <Ticket
                key={ticket.id_pedido}
                ticket={ticket}
                view={view}
                highlighted={highlightedIds.has(ticket.id_pedido)}
                busy={busyPedidoIds.has(ticket.id_pedido)}
                onToggleItem={(idDetalle, listo) => markItemMutation.mutate({ idPedido: ticket.id_pedido, idDetalle, listo })}
                onMarkReady={() => advanceMutation.mutate({ idPedido: ticket.id_pedido, transicion: 'marcarListo' })}
                onDeliver={() => advanceMutation.mutate({ idPedido: ticket.id_pedido, transicion: 'entregar' })}
                onPause={() => pauseMutation.mutate({ idPedido: ticket.id_pedido, pausado: !ticket.pausado })}
                onReport={() => setReportTicket(ticket)}
              />
            ))}
          </div>
        ) : null}
      </main>

      <Footer tickets={runtimeTickets} />

      {reportTicket ? (
        <ReportarInsumoModal
          ticket={reportTicket}
          onClose={() => setReportTicket(null)}
          onSubmit={(idDetalle, nota) => reportMutation.mutateAsync({ idPedido: reportTicket.id_pedido, idDetalle, nota })}
        />
      ) : null}
    </>
  )
}
