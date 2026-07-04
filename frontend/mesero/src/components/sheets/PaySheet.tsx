import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import type { MetodoPago, Pedido } from '@/types/api';
import { Sheet } from '@/components/sheets/Sheet';

interface PaySheetProps {
  open: boolean;
  pedido: Pedido | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (payload: { metodo: MetodoPago; propina: number; recibido?: number }) => void;
}

const methods: Array<{ key: MetodoPago; label: string }> = [
  { key: 'tarjeta', label: 'Tarjeta' },
  { key: 'efectivo', label: 'Efectivo' },
  { key: 'yape', label: 'Yape' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(value);
}

function nextBills(total: number): number[] {
  const bills = [20, 50, 100, 200].filter((bill) => bill >= total);
  return [total, ...bills].filter((value, index, array) => array.indexOf(value) === index).slice(0, 4);
}

export function PaySheet({ open, pedido, isSubmitting, onClose, onConfirm }: PaySheetProps): JSX.Element | null {
  const [method, setMethod] = useState<MetodoPago>('tarjeta');
  const [tipPct, setTipPct] = useState(0);
  const subtotal = pedido?.total ?? 0;
  const tip = Number((subtotal * tipPct).toFixed(2));
  const total = subtotal + tip;
  const [received, setReceived] = useState<number | null>(null);

  const denominations = useMemo(() => nextBills(Math.ceil(total)), [total]);
  const effectiveReceived = method === 'efectivo' ? (received ?? denominations[0] ?? total) : undefined;
  const change = effectiveReceived === undefined ? 0 : effectiveReceived - total;

  function confirm(): void {
    onConfirm({
      metodo: method,
      propina: tip,
      recibido: method === 'efectivo' ? effectiveReceived : undefined,
    });
  }

  return (
    <Sheet title="Cobrar cuenta" open={open} onClose={onClose}>
      <div className="scrollbar-none max-h-[calc(86dvh-76px)] overflow-y-auto px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
        <div className="rounded-[18px] bg-ink-900 p-4 text-white shadow-lg-soft">
          <p className="text-xs text-white/60">Total de mesa</p>
          <div className="mt-1 font-serif text-[32px] font-semibold leading-none">{formatCurrency(total)}</div>
          <p className="mt-2 text-xs text-white/60">Subtotal {formatCurrency(subtotal)} - Propina {formatCurrency(tip)}</p>
        </div>

        <div className="mt-4">
          <p className="text-label uppercase text-ink-500">Metodo</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {methods.map((item) => (
              <button
                key={item.key}
                type="button"
                className={clsx(
                  'h-11 rounded-[13px] text-xs font-semibold transition',
                  method === item.key ? 'bg-terracotta-500 text-white shadow-md-soft' : 'bg-white text-ink-500',
                )}
                onClick={() => setMethod(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="text-label uppercase text-ink-500">Propina</p>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[0, 0.1, 0.15, 0.2].map((pct) => (
              <button
                key={pct}
                type="button"
                className={clsx(
                  'h-11 rounded-[13px] text-xs font-semibold transition',
                  tipPct === pct ? 'bg-ink-900 text-white' : 'bg-white text-ink-500',
                )}
                onClick={() => setTipPct(pct)}
              >
                {pct === 0 ? 'Sin' : `${Math.round(pct * 100)}%`}
              </button>
            ))}
          </div>
        </div>

        {method === 'efectivo' ? (
          <div className="mt-4 rounded-lg border border-[rgba(31,26,20,0.08)] bg-white p-4">
            <p className="text-sm font-semibold text-ink-900">Con cuanto paga el cliente?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {denominations.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className={clsx(
                    'h-11 rounded-[13px] text-xs font-semibold',
                    effectiveReceived === amount ? 'bg-sage-500 text-white' : 'bg-cream-50 text-ink-700',
                  )}
                  onClick={() => setReceived(amount)}
                >
                  {amount === Math.ceil(total) ? 'Justo' : formatCurrency(amount)}
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-[14px] bg-cream-50 p-3 text-sm font-semibold text-ink-700">
              Cambio a entregar: <span className="text-sage-600">{formatCurrency(Math.max(change, 0))}</span>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          disabled={isSubmitting || !pedido}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-terracotta-500 text-sm font-semibold text-white shadow-md-soft active:scale-[0.98] disabled:opacity-60"
          onClick={confirm}
        >
          <CheckCircle2 aria-hidden="true" size={18} />
          {method === 'efectivo' ? `Confirmar ${formatCurrency(effectiveReceived ?? total)} recibidos` : `Confirmar pago - ${formatCurrency(total)}`}
        </button>
      </div>
    </Sheet>
  );
}
