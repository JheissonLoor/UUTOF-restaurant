import type { FilterId, KitchenTicket, TicketStatus } from '@/types/api'

export interface RuntimeTicket extends KitchenTicket {
  estado_visual: TicketStatus
  elapsed_runtime: number
}

export function getElapsed(ticket: KitchenTicket, nowMs: number): number {
  if (ticket.pausado) return ticket.elapsed_seg
  const created = new Date(ticket.creado_en).getTime()
  if (Number.isNaN(created)) return ticket.elapsed_seg
  return Math.max(ticket.elapsed_seg, Math.floor((nowMs - created) / 1000))
}

export function getVisualStatus(ticket: KitchenTicket, nowMs: number): TicketStatus {
  if (ticket.estado === 'ready') return 'ready'
  const elapsed = getElapsed(ticket, nowMs)
  return elapsed > ticket.target_seg * 0.95 ? 'urgent' : ticket.estado
}

export function withRuntime(ticket: KitchenTicket, nowMs: number): RuntimeTicket {
  return {
    ...ticket,
    estado_visual: getVisualStatus(ticket, nowMs),
    elapsed_runtime: getElapsed(ticket, nowMs),
  }
}

export function filterTickets(tickets: RuntimeTicket[], filter: FilterId): RuntimeTicket[] {
  if (filter === 'activos') return tickets
  return tickets.filter((ticket) => ticket.estado_visual === filter)
}

export function sortTickets(tickets: RuntimeTicket[]): RuntimeTicket[] {
  const rank: Record<TicketStatus, number> = {
    urgent: 0,
    new: 1,
    cooking: 2,
    ready: 3,
  }
  return [...tickets].sort((a, b) => rank[a.estado_visual] - rank[b.estado_visual] || a.id_pedido - b.id_pedido)
}

export function formatTimer(seconds: number): string {
  const maxSeconds = (99 * 60) + 59
  const safeSeconds = Math.min(seconds, maxSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const rest = safeSeconds % 60
  const suffix = seconds > maxSeconds ? '+' : ''
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}${suffix}`
}

export function playDing(enabled: boolean): void {
  if (!enabled) return
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return
  const context = new AudioContextClass()
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(880, context.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(1320, context.currentTime + 0.08)
  gain.gain.setValueAtTime(0.0001, context.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start()
  oscillator.stop(context.currentTime + 0.24)
  window.setTimeout(() => void context.close(), 300)
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext
  }
}
