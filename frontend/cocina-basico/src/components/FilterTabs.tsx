import clsx from 'clsx';

import { columns } from '@/data/mockOrders';
import type { OrderStatus } from '@/types';

export type FilterKey = 'todos' | OrderStatus;

interface FilterTabsProps {
  value: FilterKey;
  counts: Record<FilterKey, number>;
  onChange: (value: FilterKey) => void;
}

export function FilterTabs({ value, counts, onChange }: FilterTabsProps): JSX.Element {
  return (
    <div className="mb-6 flex flex-wrap gap-2.5">
      <button
        type="button"
        className={clsx(
          'flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition',
          value === 'todos'
            ? 'border-coral bg-coral text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)]'
            : 'border-[rgba(31,26,20,0.08)] bg-cream-surface text-ink-500',
        )}
        onClick={() => onChange('todos')}
      >
        Todos <span className={value === 'todos' ? 'text-white/75' : 'text-ink-400'}>({counts.todos})</span>
      </button>

      {columns.map((column) => (
        <button
          key={column.id}
          type="button"
          className={clsx(
            'flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13.5px] font-semibold transition',
            value === column.id
              ? 'border-coral bg-coral text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)]'
              : 'border-[rgba(31,26,20,0.08)] bg-cream-surface text-ink-500',
          )}
          onClick={() => onChange(column.id)}
        >
          {column.label} <span className={value === column.id ? 'text-white/75' : 'text-ink-400'}>({counts[column.id]})</span>
        </button>
      ))}
    </div>
  );
}
