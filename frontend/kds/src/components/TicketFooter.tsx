import clsx from 'clsx'

import { CheckIcon, FlameIcon } from '@/components/icons'
import type { RuntimeTicket } from '@/lib/tickets'

interface TicketFooterProps {
  ticket: RuntimeTicket
  doneCount: number
  busy?: boolean
  onMarkReady: () => void
  onDeliver: () => void
  menu: JSX.Element
}

export function TicketFooter({ ticket, doneCount, busy = false, onMarkReady, onDeliver, menu }: TicketFooterProps): JSX.Element {
  const allDone = ticket.items.length > 0 && doneCount === ticket.items.length
  const isReady = ticket.estado_visual === 'ready'

  return (
    <footer className="flex gap-2 border-t border-dashed border-white/[0.16] px-3.5 py-3">
      {isReady ? (
        <button
          type="button"
          disabled={busy}
          className="inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-sm border border-mint bg-mint px-3 text-[13px] font-semibold text-bg transition hover:bg-mint-600 disabled:opacity-60"
          onClick={onDeliver}
        >
          <CheckIcon size={14} strokeWidth={2.4} />
          Entregado
        </button>
      ) : (
        <button
          type="button"
          disabled={!allDone || busy}
          className={clsx(
            'inline-flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-sm border px-3 text-[13px] font-semibold transition',
            allDone ? 'border-mint bg-mint text-bg hover:bg-mint-600' : 'border-coral bg-coral text-white opacity-85',
          )}
          onClick={onMarkReady}
        >
          {allDone ? <CheckIcon size={14} strokeWidth={2.4} /> : <FlameIcon size={14} />}
          {allDone ? 'Listo para servir' : 'En preparación'}
        </button>
      )}
      {menu}
    </footer>
  )
}
