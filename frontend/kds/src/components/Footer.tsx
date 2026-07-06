import type { RuntimeTicket } from '@/lib/tickets'

export function Footer({ tickets }: { tickets: RuntimeTicket[] }): JSX.Element {
  const active = tickets.filter((ticket) => ticket.estado_visual !== 'ready')
  const avg = active.length === 0 ? 0 : Math.round(active.reduce((sum, ticket) => sum + ticket.elapsed_runtime, 0) / active.length / 60)
  const avgLabel = avg > 99 ? '99+ min' : `${avg} min`
  const ready = tickets.filter((ticket) => ticket.estado_visual === 'ready').length

  return (
    <footer className="flex items-center gap-4 border-t border-white/[0.08] bg-bg-2 px-[22px] text-[12.5px] text-ink-3">
      <Legend color="#F5C04A" label="Nuevo" />
      <Legend color="#F26B53" label="Cocinando" />
      <Legend color="#FF5C42" label="Urgente" />
      <Legend color="#5BD4B0" label="Listo" />
      <div className="flex-1" />
      <Metric label="Tiempo prom" value={avgLabel} />
      <Metric label="Hora pico" value="20:30" />
      <Metric label="Listos ahora" value={String(ready)} />
    </footer>
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

function Metric({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <span className="rounded-full border border-white/[0.08] bg-surface px-3 py-1">
      {label}: <b className="text-ink tnum">{value}</b>
    </span>
  )
}
