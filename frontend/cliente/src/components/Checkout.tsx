import { useEffect, useMemo, useState } from 'react';

import { crearResena, pedirCuenta, registrarPago } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { CheckIcon, CloseIcon, SparkIcon } from '@/components/icons';
import { formatCurrency, formatOrderFolio } from '@/lib/format';
import type { MetodoPago, PedidoPublico } from '@/types';

const methods: Array<{ id: MetodoPago; label: string; detail: string }> = [
  { id: 'tarjeta', label: 'Tarjeta', detail: 'Crédito o débito' },
  { id: 'yape', label: 'Yape / QR', detail: 'Escanea y confirma' },
  { id: 'efectivo', label: 'Efectivo', detail: 'Paga al mesero' },
  { id: 'mixto', label: 'Mixto', detail: 'Combinar métodos' },
];

export function Checkout({ pedido, onClose, onFinished }: { pedido: PedidoPublico | null; onClose: () => void; onFinished: () => void }): JSX.Element | null {
  const [step, setStep] = useState<'review' | 'pay' | 'success'>('review');
  const [method, setMethod] = useState<MetodoPago>('tarjeta');
  const [tipPct, setTipPct] = useState(10);
  const [folio, setFolio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    if (!pedido) return;
    setStep('review');
    setMethod('tarjeta');
    setTipPct(10);
    setError(null);
    pedirCuenta(pedido.id_pedido)
      .then((cuenta) => setFolio(cuenta.folio))
      .catch(() => setFolio(formatOrderFolio(pedido.id_pedido)));
  }, [pedido]);

  const tip = useMemo(() => Math.round((pedido?.total ?? 0) * tipPct) / 100, [pedido?.total, tipPct]);
  const total = (pedido?.total ?? 0) + tip;

  if (!pedido) return null;
  const activePedido = pedido;

  async function handlePay(): Promise<void> {
    setError(null);
    setIsProcessing(true);
    try {
      if (method !== 'efectivo') {
        await registrarPago(activePedido.id_pedido, method, activePedido.total, tip);
      }
      setStep('success');
    } catch (payError) {
      setError(getErrorDetail(payError, 'No se pudo procesar el pago.'));
    } finally {
      setIsProcessing(false);
    }
  }

  async function finishWithReview(): Promise<void> {
    try {
      await crearResena({ id_pedido: activePedido.id_pedido, calificacion: rating, comentario: 'Experiencia registrada desde App Cliente' });
    } catch {
      // La reseña es secundaria al cierre del pago.
    }
    onFinished();
  }

  return (
    <>
      <button type="button" className="fixed inset-0 z-50 bg-ink-900/35" onClick={onClose} aria-label="Cerrar checkout" />
      <aside className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-h-[92dvh] max-w-[440px] overflow-y-auto rounded-t-2xl bg-cream-surface shadow-[0_-18px_48px_-18px_rgba(31,26,20,0.45)] animate-pop-in" data-screen-label="08 Checkout postpago">
        <header className="flex items-center gap-3 border-b border-[rgba(31,26,20,0.08)] px-4 py-4">
          <div className="flex-1">
            <p className="font-mono text-xs font-bold text-coral-600">{folio ?? formatOrderFolio(pedido.id_pedido)}</p>
            <h2 className="font-serif text-[25px] font-semibold">Tu cuenta</h2>
          </div>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-sm bg-cream-bg2 text-ink-500" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="p-4">
          {step === 'review' ? (
            <>
              <section className="rounded-xl bg-cream-bg p-4">
                <h3 className="font-serif text-xl font-semibold">Consumo</h3>
                <div className="mt-3 space-y-2">
                  {pedido.items.map((item) => (
                    <div key={item.id_detalle} className="flex justify-between gap-3 text-sm">
                      <span>{item.qty}x {item.nombre}</span>
                      <span className="font-mono tnum">{formatCurrency(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-4 rounded-xl bg-cream-bg p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-serif text-xl font-semibold">Propina</h3>
                  <span className="font-mono font-bold text-coral-600">{formatCurrency(tip)}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 10, 15, 20].map((pct) => (
                    <button key={pct} type="button" className={`min-h-11 rounded-sm text-sm font-bold ${tipPct === pct ? 'bg-coral text-white' : 'bg-cream-surface text-ink-500'}`} onClick={() => setTipPct(pct)}>
                      {pct === 0 ? 'Sin' : `${pct}%`}
                    </button>
                  ))}
                </div>
              </section>

              <div className="mt-4 rounded-xl bg-ink-900 p-4 text-white">
                <div className="flex justify-between text-sm text-white/65"><span>Subtotal</span><span>{formatCurrency(pedido.total)}</span></div>
                <div className="mt-2 flex justify-between text-sm text-white/65"><span>Propina</span><span>{formatCurrency(tip)}</span></div>
                <div className="mt-3 flex justify-between font-serif text-2xl font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>

              <button type="button" className="mt-4 min-h-12 w-full rounded-md bg-coral px-4 text-sm font-semibold text-white" onClick={() => setStep('pay')}>
                Continuar al pago
              </button>
            </>
          ) : null}

          {step === 'pay' ? (
            <>
              <div className="grid gap-3">
                {methods.map((item) => (
                  <button key={item.id} type="button" className={`flex min-h-[72px] items-center gap-3 rounded-xl border p-3 text-left ${method === item.id ? 'border-coral bg-coral-50' : 'border-[rgba(31,26,20,0.08)] bg-cream-bg'}`} onClick={() => setMethod(item.id)}>
                    <span className="grid h-10 w-10 place-items-center rounded-md bg-cream-surface font-serif font-bold text-coral-600">{item.label.charAt(0)}</span>
                    <span className="flex-1">
                      <span className="block font-semibold text-ink-900">{item.label}</span>
                      <span className="text-xs text-ink-500">{item.detail}</span>
                    </span>
                    {method === item.id ? <CheckIcon className="text-coral-600" size={17} /> : null}
                  </button>
                ))}
              </div>

              {method === 'yape' ? (
                <div className="mt-4 grid place-items-center rounded-xl bg-cream-bg p-5">
                  <div className="grid h-32 w-32 grid-cols-5 gap-1 rounded-md bg-white p-3 shadow-soft">
                    {Array.from({ length: 25 }).map((_, index) => <span key={index} className={(index * 5 + 2) % 3 === 0 ? 'bg-ink-900' : 'bg-ink-900/10'} />)}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink-700">Escanea y confirma en Yape</p>
                </div>
              ) : null}

              {method === 'efectivo' ? <div className="mt-4 rounded-md bg-sun-50 px-4 py-3 text-sm text-sun-600">El mesero verificará la recepción del efectivo desde su app.</div> : null}
              {error ? <div className="mt-4 rounded-md bg-coral-50 px-4 py-3 text-sm text-coral-600">{error}</div> : null}

              <button type="button" disabled={isProcessing} className="mt-4 min-h-12 w-full rounded-md bg-coral px-4 text-sm font-semibold text-white disabled:opacity-60" onClick={() => void handlePay()}>
                {isProcessing ? 'Procesando...' : method === 'efectivo' ? `Confirmar efectivo ${formatCurrency(total)}` : `Pagar ${formatCurrency(total)}`}
              </button>
            </>
          ) : null}

          {step === 'success' ? (
            <section className="py-4 text-center">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-mint-50 text-mint-600">
                <CheckIcon size={38} />
              </div>
              <h3 className="mt-5 font-serif text-[30px] font-semibold">{method === 'efectivo' ? 'Pago por verificar' : '¡Gracias por venir!'}</h3>
              <p className="mx-auto mt-2 max-w-[300px] text-sm leading-6 text-ink-500">{method === 'efectivo' ? 'Tu cuenta queda pendiente hasta que el mesero confirme el efectivo.' : 'Tu pago se registró correctamente.'}</p>
              <div className="mt-5 rounded-xl bg-cream-bg p-4 text-left">
                <div className="flex justify-between text-sm"><span>Folio</span><span className="font-mono">{folio}</span></div>
                <div className="mt-2 flex justify-between text-sm"><span>Método</span><span>{methods.find((item) => item.id === method)?.label}</span></div>
                <div className="mt-2 flex justify-between font-serif text-xl font-bold"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>
              <div className="mt-5 rounded-xl bg-cream-bg p-4">
                <div className="mb-3 flex items-center justify-center gap-2 font-serif text-xl font-semibold">
                  <SparkIcon className="text-sun-600" size={18} />
                  Deja tu reseña
                </div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" className={`grid h-11 w-11 place-items-center rounded-full text-lg ${rating >= star ? 'bg-sun text-white' : 'bg-cream-surface text-ink-400'}`} onClick={() => setRating(star)}>
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" className="mt-5 min-h-12 w-full rounded-md bg-coral px-4 text-sm font-semibold text-white" onClick={() => void finishWithReview()}>
                Volver al inicio
              </button>
            </section>
          ) : null}
        </div>
      </aside>
    </>
  );
}
