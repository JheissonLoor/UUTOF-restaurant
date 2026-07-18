import clsx from 'clsx';
import { Banknote, CheckCircle2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Sheet } from '@/components/sheets/Sheet';
import type { PagoPendiente } from '@/types/api';

interface CashVerificationSheetProps {
  open: boolean;
  pago: PagoPendiente | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (recibido: number) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
}

function getDenominations(total: number): number[] {
  return [total, ...[20, 50, 100, 200].filter((bill) => bill >= total)]
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 4);
}

export function CashVerificationSheet({ open, pago, isSubmitting, onClose, onConfirm }: CashVerificationSheetProps): JSX.Element | null {
  const [recibido, setRecibido] = useState(0);
  const denominations = useMemo(() => getDenominations(Math.ceil(pago?.total ?? 0)), [pago?.total]);

  useEffect(() => {
    if (pago) setRecibido(pago.total);
  }, [pago]);

  if (!pago) return null;
  const cambio = Math.max(recibido - pago.total, 0);
  const isValid = recibido >= pago.total;

  return (
    <Sheet title="Verificar efectivo" open={open} onClose={onClose}>
      <div className="px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-4">
        <div className="rounded-[18px] bg-ink-900 p-4 text-white shadow-lg-soft">
          <div className="flex items-center gap-2 text-xs text-white/60"><Banknote size={15} /> Mesa {pago.numero_mesa}</div>
          <div className="mt-1 font-serif text-[32px] font-semibold">{formatCurrency(pago.total)}</div>
          <p className="mt-2 text-xs text-white/60">Solicitado por {pago.cliente}</p>
        </div>

        <p className="mt-4 text-label uppercase text-ink-500">Monto recibido</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {denominations.map((amount) => (
            <button
              key={amount}
              type="button"
              className={clsx('h-11 rounded-[13px] text-xs font-semibold', recibido === amount ? 'bg-sage-500 text-white' : 'bg-white text-ink-700')}
              onClick={() => setRecibido(amount)}
            >
              {amount === Math.ceil(pago.total) ? 'Monto exacto' : formatCurrency(amount)}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-xs font-semibold text-ink-500" htmlFor="cash-received">Otro monto</label>
        <input
          id="cash-received"
          type="number"
          min={pago.total}
          step="0.01"
          value={recibido}
          className="mt-1 h-11 w-full rounded-[13px] border border-[rgba(31,26,20,0.15)] bg-white px-3 text-sm text-ink-900"
          onChange={(event) => setRecibido(Number(event.target.value))}
        />
        <div className="mt-3 rounded-[14px] bg-cream-50 p-3 text-sm font-semibold text-ink-700">
          Cambio a entregar: <span className="text-sage-600">{formatCurrency(cambio)}</span>
        </div>
        <button
          type="button"
          disabled={isSubmitting || !isValid}
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-terracotta-500 text-sm font-semibold text-white shadow-md-soft disabled:opacity-60"
          onClick={() => onConfirm(recibido)}
        >
          <CheckCircle2 size={18} />
          {isSubmitting ? 'Verificando...' : 'Confirmar efectivo recibido'}
        </button>
      </div>
    </Sheet>
  );
}
