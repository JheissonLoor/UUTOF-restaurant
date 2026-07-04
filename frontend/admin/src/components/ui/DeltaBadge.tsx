import clsx from 'clsx';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

export type DeltaVariant = 'up' | 'down' | 'flat';

interface DeltaBadgeProps {
  value: number;
  label?: string;
}

function getVariant(value: number): DeltaVariant {
  if (value > 0) return 'up';
  if (value < 0) return 'down';
  return 'flat';
}

export function DeltaBadge({ value, label }: DeltaBadgeProps): JSX.Element {
  const variant = getVariant(value);
  const Icon = variant === 'up' ? ArrowUp : variant === 'down' ? ArrowDown : Minus;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold tnum',
        variant === 'up' && 'bg-sage-100 text-success',
        variant === 'down' && 'bg-wine-100 text-danger',
        variant === 'flat' && 'bg-cream-200 text-ink-500',
      )}
    >
      <Icon aria-hidden="true" size={11} strokeWidth={2} />
      {Math.abs(value).toFixed(1)}%
      {label ? <span className="font-medium">{label}</span> : null}
    </span>
  );
}
