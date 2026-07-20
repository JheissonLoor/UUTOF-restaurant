import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value?: string;
  delta?: number;
  loading?: boolean;
}

export function KpiCard({ label, value, delta = 0, loading = false }: KpiCardProps) {
  if (loading) {
    return (
      <article className="h-[132px] animate-pulse rounded-2xl border border-[#E7DED3] bg-surface p-[18px_20px]">
        <div className="h-3 w-28 rounded bg-bg2" />
        <div className="mt-4 h-9 w-36 rounded bg-bg2" />
        <div className="mt-3 h-6 w-24 rounded-full bg-bg2" />
        <span className="sr-only">Cargando {label}</span>
      </article>
    );
  }

  const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const DeltaIcon = direction === 'up' ? ArrowUp : direction === 'down' ? ArrowDown : Minus;
  const deltaClasses = {
    up: 'bg-mint/10 text-mint-dark',
    down: 'bg-danger/10 text-danger',
    flat: 'bg-bg2 text-ink3',
  }[direction];
  const deltaText = direction === 'flat' ? 'estable' : `${Math.abs(delta).toFixed(0)}% vs. periodo anterior`;

  return (
    <article className="h-[132px] rounded-2xl border border-[#E7DED3] bg-surface p-[18px_20px] transition-shadow hover:shadow-card">
      <p className="font-mono text-[10px] font-semibold uppercase text-ink4">{label}</p>
      <p className="my-2 font-display text-[29px] font-semibold leading-none text-ink tabular-nums">
        {value ?? '—'}
      </p>
      <span className={`inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[11.5px] font-semibold ${deltaClasses}`}>
        <DeltaIcon size={13} strokeWidth={2.2} aria-hidden="true" />
        {deltaText}
      </span>
    </article>
  );
}
