import clsx from 'clsx'

import type { TicketStatus } from '@/types/api'

export function ProgressBar({ done, total, status }: { done: number; total: number; status: TicketStatus }): JSX.Element {
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 text-[11px] text-ink-3">
      <span className="tnum">{done}/{total}</span>
      <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-300',
            status === 'ready' ? 'bg-gradient-to-r from-mint to-mint-600' : 'bg-gradient-to-r from-coral to-coral-700',
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
