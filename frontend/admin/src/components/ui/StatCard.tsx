import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';

import { DeltaBadge } from '@/components/ui/DeltaBadge';
import { Sparkline } from '@/components/charts/Sparkline';

type IconVariant = 'green' | 'blue' | 'terracotta' | 'saffron';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconVariant: IconVariant;
  delta?: number;
  deltaLabel?: string;
  spark?: number[];
  sparkColor: string;
  sparkFill: string;
  onClick?: () => void;
}

const iconClasses: Record<IconVariant, string> = {
  green: 'bg-sage-100 text-sage-500',
  blue: 'bg-sky-100 text-sky-500',
  terracotta: 'bg-terracotta-100 text-terracotta-500',
  saffron: 'bg-saffron-100 text-saffron-500',
};

export function StatCard({
  label,
  value,
  icon: Icon,
  iconVariant,
  delta,
  deltaLabel,
  spark,
  sparkColor,
  sparkFill,
  onClick,
}: StatCardProps): JSX.Element {
  const sparkData = useMemo(() => (spark && spark.length > 1 ? spark : [0, 0]), [spark]);

  return (
    <button
      type="button"
      className={clsx(
        'group rounded-lg border border-[rgba(42,30,20,0.08)] bg-white px-6 py-5 text-left shadow-sm-soft transition duration-200 hover:-translate-y-0.5 hover:border-[rgba(42,30,20,0.14)] hover:shadow-md-soft',
        !onClick && 'cursor-default',
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-label uppercase text-ink-500">{label}</div>
          <div className="mt-2 font-serif text-display-lg text-ink-900 tnum">{value}</div>
        </div>
        <div className={clsx('grid h-10 w-10 shrink-0 place-items-center rounded-md', iconClasses[iconVariant])}>
          <Icon aria-hidden="true" size={18} strokeWidth={1.8} />
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {typeof delta === 'number' ? <DeltaBadge value={delta} /> : null}
          {deltaLabel ? <span className="truncate text-xs text-ink-500">{deltaLabel}</span> : null}
        </div>
        <Sparkline data={sparkData} color={sparkColor} fill={sparkFill} />
      </div>
    </button>
  );
}
