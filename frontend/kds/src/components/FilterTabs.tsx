import type { FilterId } from '@/types/api'
import { AlertIcon, CheckIcon } from '@/components/icons'

const tabs: Array<{ id: FilterId; label: string; icon?: 'alert' | 'check' }> = [
  { id: 'activos', label: 'Activos' },
  { id: 'new', label: 'Nuevos' },
  { id: 'cooking', label: 'Cocinando' },
  { id: 'urgent', label: 'Urgentes', icon: 'alert' },
  { id: 'ready', label: 'Listos', icon: 'check' },
]

export function FilterTabs({ active, counts, onChange }: { active: FilterId; counts: Record<FilterId, number>; onChange: (filter: FilterId) => void }): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`inline-flex items-center gap-2 rounded-[11px] border px-4 py-2 text-[13px] font-medium transition ${active === tab.id ? 'border-coral bg-coral/10 text-coral' : 'border-white/[0.08] bg-surface text-ink-2 hover:border-white/[0.16] hover:text-ink'}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon === 'alert' ? <AlertIcon size={13} /> : null}
          {tab.icon === 'check' ? <CheckIcon size={13} /> : null}
          {tab.label}
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold tnum ${active === tab.id ? 'bg-coral text-white' : 'bg-bg text-ink'}`}>{counts[tab.id]}</span>
        </button>
      ))}
    </div>
  )
}
