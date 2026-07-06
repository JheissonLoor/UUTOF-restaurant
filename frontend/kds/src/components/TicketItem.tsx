import clsx from 'clsx'

import { CheckIcon } from '@/components/icons'
import type { TicketItem as TicketItemType } from '@/types/api'

interface TicketItemProps {
  item: TicketItemType
  compact?: boolean
  disabled?: boolean
  onToggle: () => void
}

export function TicketItem({ item, compact = false, disabled = false, onToggle }: TicketItemProps): JSX.Element {
  return (
    <button
      type="button"
      disabled={disabled || item.id_detalle === undefined}
      className={clsx(
        'grid w-full grid-cols-[26px_1fr_auto] items-start gap-2.5 rounded-sm px-1 py-2 text-left transition',
        !disabled && 'hover:bg-surface-2',
        item.done && 'opacity-45',
        compact && 'grid-cols-[24px_1fr_auto] py-1.5',
      )}
      onClick={onToggle}
    >
      <span className={clsx('grid h-[26px] w-[26px] place-items-center rounded-[7px] text-[13px] font-bold tnum', item.done ? 'bg-mint/10 text-mint' : 'bg-coral/10 text-coral')}>
        {item.qty}
      </span>
      <span className="min-w-0">
        <span className={clsx('block text-[15px] font-medium leading-[1.3] text-ink', item.done && 'line-through', compact && 'text-sm')}>{item.nombre}</span>
        {(item.modificadores.length > 0 || item.nota || item.alergenos.length > 0) ? (
          <span className="mt-1 flex flex-wrap gap-1 text-[11px] text-ink-3">
            {item.modificadores.map((modificador) => <span key={modificador} className="rounded-[5px] border border-white/[0.08] bg-bg px-1.5 py-0.5">{modificador}</span>)}
            {item.nota ? <span className="rounded-[5px] border border-sun/40 bg-bg px-1.5 py-0.5 text-sun">Aviso: {item.nota}</span> : null}
            {item.alergenos.length > 0 ? <span className="rounded-[5px] border border-coral/40 bg-bg px-1.5 py-0.5 text-coral">{item.alergenos.join(' · ')}</span> : null}
          </span>
        ) : null}
      </span>
      <span className={clsx('mt-0.5 grid h-[22px] w-[22px] place-items-center rounded-full border border-white/[0.16]', item.done && 'border-mint bg-mint text-bg')}>
        {item.done ? <CheckIcon size={13} strokeWidth={2.5} /> : null}
      </span>
    </button>
  )
}
