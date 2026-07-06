import clsx from 'clsx'

import { AlertIcon, PauseIcon, PlateIcon, ZapIcon } from '@/components/icons'
import { ProgressBar } from '@/components/ProgressBar'
import { TicketFooter } from '@/components/TicketFooter'
import { TicketItem } from '@/components/TicketItem'
import { TicketMenu } from '@/components/TicketMenu'
import { formatTimer, type RuntimeTicket } from '@/lib/tickets'
import type { ViewMode } from '@/types/api'

interface TicketProps {
  ticket: RuntimeTicket
  view: ViewMode
  highlighted?: boolean
  busy?: boolean
  onToggleItem: (idDetalle: number, listo: boolean) => void
  onMarkReady: () => void
  onDeliver: () => void
  onPause: () => void
  onReport: () => void
}

export function Ticket({ ticket, view, highlighted = false, busy = false, onToggleItem, onMarkReady, onDeliver, onPause, onReport }: TicketProps): JSX.Element {
  const doneCount = ticket.items.filter((item) => item.done).length
  const overTime = ticket.elapsed_runtime > ticket.target_seg
  const compact = view === 'list'

  return (
    <article
      className={clsx(
        'relative flex flex-col overflow-hidden rounded-[16px] border bg-surface transition',
        compact ? 'min-h-[170px]' : 'min-h-[260px]',
        ticket.estado_visual === 'urgent' ? 'border-danger urgent-pulse' : 'border-white/[0.08]',
        ticket.estado_visual === 'ready' && 'border-mint bg-gradient-to-b from-mint/10 to-surface',
        ticket.estado_visual === 'new' && 'border-sun/40',
        highlighted && 'ring-2 ring-sun/80',
      )}
    >
      <div className={clsx('h-1.5', stripClass(ticket.estado_visual))} />
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-dashed border-white/[0.16] px-3.5 py-3">
        <div className="font-serif text-[26px] font-semibold leading-none tracking-[-0.02em] tnum">#{ticket.num}</div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">
            <b className="text-ink">{ticket.mesa}</b>
            {ticket.alerta_insumo ? <AlertIcon size={13} className="text-sun" /> : null}
            {ticket.pausado ? <PauseIcon size={13} className="text-coral" /> : null}
          </div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-4">
            {ticket.origen === 'app_cliente' ? <ZapIcon size={10} /> : <PlateIcon size={10} />}
            {ticket.origen === 'app_cliente' ? 'App cliente' : 'Mesero'} · {ticket.mesero}
          </div>
        </div>
        <div className="text-right">
          <div className={clsx('font-serif text-[22px] font-semibold tracking-[-0.01em] tnum', ticket.estado_visual === 'urgent' && 'text-danger', ticket.estado_visual === 'ready' && 'text-mint')}>
            {formatTimer(ticket.elapsed_runtime)}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-4">
            {ticket.pausado ? 'Pausado' : overTime ? 'Sobre tiempo' : `de ${formatTimer(ticket.target_seg)}`}
          </div>
        </div>
      </header>

      <ProgressBar done={doneCount} total={ticket.items.length} status={ticket.estado_visual} />

      <div className={clsx('flex flex-1 flex-col gap-1 px-3.5 pb-2', compact && 'grid grid-cols-2 gap-x-3')}>
        {ticket.items.map((item) => (
          <TicketItem
            key={item.id}
            item={item}
            compact={compact}
            disabled={busy || ticket.estado_backend === 'pagado'}
            onToggle={() => item.id_detalle !== undefined && onToggleItem(item.id_detalle, !item.done)}
          />
        ))}
      </div>

      <TicketFooter
        ticket={ticket}
        doneCount={doneCount}
        busy={busy}
        onMarkReady={onMarkReady}
        onDeliver={onDeliver}
        menu={<TicketMenu pausado={ticket.pausado} onPause={onPause} onReport={onReport} />}
      />
    </article>
  )
}

function stripClass(status: RuntimeTicket['estado_visual']): string {
  if (status === 'new') return 'bg-gradient-to-r from-sun to-[#E8B14A]'
  if (status === 'ready') return 'bg-gradient-to-r from-mint to-mint-600'
  if (status === 'urgent') return 'bg-gradient-to-r from-danger to-coral-700'
  return 'bg-gradient-to-r from-coral to-coral-700'
}
