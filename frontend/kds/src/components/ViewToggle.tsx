import { CardsIcon, ListIcon } from '@/components/icons'
import type { ViewMode } from '@/types/api'

export function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (view: ViewMode) => void }): JSX.Element {
  return (
    <div className="flex rounded-sm border border-white/[0.08] bg-surface p-1">
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-xs font-semibold ${value === 'cards' ? 'bg-bg text-ink' : 'text-ink-3 hover:text-ink'}`}
        onClick={() => onChange('cards')}
      >
        <CardsIcon size={13} />
        Tarjetas
      </button>
      <button
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-[7px] px-3 py-1.5 text-xs font-semibold ${value === 'list' ? 'bg-bg text-ink' : 'text-ink-3 hover:text-ink'}`}
        onClick={() => onChange('list')}
      >
        <ListIcon size={13} />
        Lista
      </button>
    </div>
  )
}
