import clsx from 'clsx';
import type { ReactNode } from 'react';

interface PillProps {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const toneClasses: Record<NonNullable<PillProps['tone']>, string> = {
  neutral: 'bg-cream-100 text-ink-700',
  success: 'bg-sage-100 text-sage-500',
  warning: 'bg-saffron-100 text-saffron-600',
  danger: 'bg-wine-100 text-wine-500',
  info: 'bg-sky-100 text-sky-500',
};

export function Pill({ children, tone = 'neutral', className }: PillProps): JSX.Element {
  return (
    <span className={clsx('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', toneClasses[tone], className)}>
      {children}
    </span>
  );
}
