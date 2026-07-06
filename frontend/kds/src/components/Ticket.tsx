import clsx from 'clsx'

import { CheckIcon, ClockIcon, FlameIcon, PlateIcon, ZapIcon } from '@/components/icons'
import { useElapsedTimer } from '@/hooks/useElapsedTimer'
import type { KitchenTicket, TicketItem } from '@/types/api'

export function Ticket({ ticket }: { ticket: KitchenTicket }): JSX.Element {
  const elapsed = useElapsedTimer(ticket.creado_en, ticket.estado === 'ready')
  const visualStatus = ticket.estado !== 'ready' && elapsed > ticket.target_seg * 0.95 ? 'urgent' : ticket.estado
  const doneCount = ticket.items.filter((item) => item.done).length
  const progress = ticket.items.length === 0 ? 0 : Math.round((doneCount / ticket.items.length) * 100)
  const overTime = elapsed > ticket.target_seg

  return (
    <article
      className={clsx(
        'relative flex min-h-[260px] flex-col overflow-hidden rounded-[16px] border bg-surface transition',
        visualStatus === 'urgent' ? 'border-danger urgent-pulse' : 'border-white/[0.08]',
        visualStatus === 'ready' && 'border-mint bg-gradient-to-b from-mint/10 to-surface',
        visualStatus === 'new' && 'border-sun/40',
      )}
    >
      <div className={clsx('h-1.5', stripClass(visualStatus))} />
      <header className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-dashed border-white/[0.16] px-3.5 py-3">
        <div className="font-serif text-[26px] font-semibold leading-none tracking-[-0.02em] tnum">#{ticket.num}</div>
        <div className="min-w-0">
          <div className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-3">
            <b className="text-ink">{ticket.mesa}</b>
          </div>
          <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-ink-4">
            {ticket.origen === 'app_cliente' ? <ZapIcon size={10} /> : <PlateIcon size={10} />}
            {ticket.origen === 'app_cliente' ? 'App cliente' : 'Mesero'} · {ticket.mesero}
          </div>
        </div>
        <div className="text-right">
          <div className={clsx('font-serif text-[22px] font-semibold tracking-[-0.01em] tnum', visualStatus === 'urgent' && 'text-danger', visualStatus === 'ready' && 'text-mint')}>
            {formatTimer(elapsed)}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-4">
            {overTime ? 'Sobre tiempo' : `de ${formatTimer(ticket.target_seg)}`}
          </div>
        </div>
      </header>

      <div className="flex items-center gap-2 px-3.5 py-2 text-[11px] text-ink-3">
        <span className="tnum">{doneCount}/{ticket.items.length}</span>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg">
          <div className={clsx('h-full rounded-full transition-all', visualStatus === 'ready' ? 'bg-gradient-to-r from-mint to-mint-600' : 'bg-gradient-to-r from-coral to-coral-700')} style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3.5 pb-2">
        {ticket.items.map((item) => (
          <TicketItemRow key={item.id} item={item} />
        ))}
      </div>

      <footer className="flex gap-2 border-t border-dashed border-white/[0.16] px-3.5 py-3">
        <button
          type="button"
          disabled
          className={clsx(
            'inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-sm border px-3 text-[13px] font-semibold',
            visualStatus === 'ready'
              ? 'border-mint bg-mint text-bg'
              : 'border-coral bg-coral text-white disabled:opacity-80',
          )}
        >
          {visualStatus === 'ready' ? <CheckIcon size={14} strokeWidth={2.4} /> : <FlameIcon size={14} />}
          {visualStatus === 'ready' ? 'Listo para servir' : 'En preparación'}
        </button>
        <button type="button" disabled className="grid h-10 w-10 place-items-center rounded-sm border border-white/[0.16] text-ink-3 disabled:opacity-60">
          <ClockIcon size={15} />
        </button>
      </footer>
    </article>
  )
}

function TicketItemRow({ item }: { item: TicketItem }): JSX.Element {
  return (
    <div className={clsx('grid grid-cols-[26px_1fr_auto] items-start gap-2.5 rounded-sm px-1 py-2', item.done && 'opacity-45')}>
      <div className={clsx('grid h-[26px] w-[26px] place-items-center rounded-[7px] text-[13px] font-bold tnum', item.done ? 'bg-mint/10 text-mint' : 'bg-coral/10 text-coral')}>
        {item.qty}
      </div>
      <div className="min-w-0">
        <div className={clsx('text-[15px] font-medium leading-[1.3] text-ink', item.done && 'line-through')}>{item.nombre}</div>
        {(item.modificadores.length > 0 || item.nota || item.alergenos.length > 0) ? (
          <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-ink-3">
            {item.modificadores.map((modificador) => <span key={modificador} className="rounded-[5px] border border-white/[0.08] bg-bg px-1.5 py-0.5">{modificador}</span>)}
            {item.nota ? <span className="rounded-[5px] border border-sun/40 bg-bg px-1.5 py-0.5 text-sun">Aviso: {item.nota}</span> : null}
            {item.alergenos.length > 0 ? <span className="rounded-[5px] border border-coral/40 bg-bg px-1.5 py-0.5 text-coral">{item.alergenos.join(' · ')}</span> : null}
          </div>
        ) : null}
      </div>
      <div className={clsx('mt-0.5 grid h-[22px] w-[22px] place-items-center rounded-full border border-white/[0.16]', item.done && 'border-mint bg-mint text-bg')}>
        {item.done ? <CheckIcon size={13} strokeWidth={2.5} /> : null}
      </div>
    </div>
  )
}

function stripClass(status: KitchenTicket['estado']): string {
  if (status === 'new') return 'bg-gradient-to-r from-sun to-[#E8B14A]'
  if (status === 'ready') return 'bg-gradient-to-r from-mint to-mint-600'
  if (status === 'urgent') return 'bg-gradient-to-r from-danger to-coral-700'
  return 'bg-gradient-to-r from-coral to-coral-700'
}

function formatTimer(seconds: number): string {
  const maxSeconds = (99 * 60) + 59
  const safeSeconds = Math.min(seconds, maxSeconds)
  const minutes = Math.floor(safeSeconds / 60)
  const rest = safeSeconds % 60
  const suffix = seconds > maxSeconds ? '+' : ''
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}${suffix}`
}
