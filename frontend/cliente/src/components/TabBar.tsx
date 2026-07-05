import clsx from 'clsx';

import { BagIcon, CalendarIcon, HomeIcon, MenuIcon } from '@/components/icons';
import type { AppTab } from '@/types';

const tabs: Array<{ id: AppTab; label: string; Icon: typeof HomeIcon }> = [
  { id: 'inicio', label: 'Inicio', Icon: HomeIcon },
  { id: 'reservar', label: 'Reservar', Icon: CalendarIcon },
  { id: 'menu', label: 'Menú', Icon: MenuIcon },
  { id: 'pedidos', label: 'Pedidos', Icon: BagIcon },
];

export function TabBar({ active, onChange }: { active: AppTab; onChange: (tab: AppTab) => void }): JSX.Element {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto grid h-[72px] max-w-[440px] grid-cols-4 border-t border-[rgba(31,26,20,0.08)] bg-cream-surface/95 px-2 pb-2 pt-1 shadow-[0_-18px_30px_-24px_rgba(31,26,20,0.45)] backdrop-blur">
      {tabs.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={clsx('flex min-h-11 flex-col items-center justify-center gap-1 rounded-sm text-[11px] font-semibold transition', active === id ? 'bg-coral-50 text-coral-600' : 'text-ink-400')}
          onClick={() => onChange(id)}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </nav>
  );
}
