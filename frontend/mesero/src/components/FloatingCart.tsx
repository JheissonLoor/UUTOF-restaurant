import { Send } from 'lucide-react';

interface FloatingCartProps {
  count: number;
  total: number;
  isSubmitting: boolean;
  onSubmit: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

export function FloatingCart({ count, total, isSubmitting, onSubmit }: FloatingCartProps): JSX.Element | null {
  if (count === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-[linear-gradient(180deg,transparent,#FAF6F0_30%)] px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-6">
      <button
        type="button"
        disabled={isSubmitting}
        className="pointer-events-auto flex h-14 w-full items-center justify-between rounded-[16px] bg-ink-900 px-4 text-white shadow-lg-soft transition active:scale-[0.98] disabled:opacity-60"
        onClick={onSubmit}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-7 min-w-7 place-items-center rounded-full bg-terracotta-500 px-2 text-xs tnum">{count}</span>
          Enviar a cocina
        </span>
        <span className="flex items-center gap-2 font-serif text-[17px] font-semibold">
          {formatCurrency(total)}
          <Send aria-hidden="true" size={17} />
        </span>
      </button>
    </div>
  );
}
