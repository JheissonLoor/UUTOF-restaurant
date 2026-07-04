import { Minus, Plus, Users } from 'lucide-react';
import { useState } from 'react';

import { Sheet } from '@/components/sheets/Sheet';
import type { Mesa } from '@/types/api';

interface SentarComensalesProps {
  mesa: Mesa | null;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (mesa: Mesa, comensales: number) => void;
}

export function SentarComensales({ mesa, isSubmitting, errorMessage, onClose, onConfirm }: SentarComensalesProps): JSX.Element | null {
  const [comensales, setComensales] = useState(2);
  const open = mesa !== null;
  const max = mesa?.capacidad ?? 1;
  const safeCount = Math.min(comensales, max);

  function updateCount(next: number): void {
    setComensales(Math.min(Math.max(next, 1), max));
  }

  return (
    <Sheet title="Sentar comensales" open={open} onClose={onClose}>
      {mesa ? (
        <div className="px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
          <div className="rounded-[18px] bg-white p-4 text-center shadow-sm-soft">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-cream-100 text-terracotta-500">
              <Users aria-hidden="true" size={22} />
            </div>
            <h3 className="mt-3 font-serif text-[24px] font-semibold">Mesa {mesa.numero}</h3>
            <p className="mt-1 text-sm text-ink-500">Capacidad maxima: {mesa.capacidad}</p>

            <div className="mx-auto mt-5 flex max-w-[220px] items-center justify-between rounded-[16px] bg-cream-50 p-2">
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-700" onClick={() => updateCount(safeCount - 1)}>
                <Minus aria-hidden="true" size={17} />
              </button>
              <span className="font-serif text-[30px] font-semibold tnum">{safeCount}</span>
              <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white text-ink-700" onClick={() => updateCount(safeCount + 1)}>
                <Plus aria-hidden="true" size={17} />
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-3 rounded-[14px] border border-wine-100 bg-white px-3 py-2 text-center text-xs font-semibold text-wine-500">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            disabled={isSubmitting}
            className="mt-4 h-12 w-full rounded-[14px] bg-terracotta-500 text-sm font-semibold text-white shadow-md-soft active:scale-[0.98] disabled:opacity-60"
            onClick={() => onConfirm(mesa, safeCount)}
          >
            Crear pedido
          </button>
        </div>
      ) : null}
    </Sheet>
  );
}
