import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, CreditCard, Smartphone, Wallet, Layers, Sparkles, Star } from 'lucide-react';

import { crearResena, pedirCuenta, registrarPago } from '@/api/pedidos';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { MetodoPago, PedidoPublico } from '@/types';

const methods: Array<{ id: MetodoPago; label: string; detail: string; icon: typeof CreditCard }> = [
  { id: 'tarjeta', label: 'Tarjeta', detail: 'Crédito o débito', icon: CreditCard },
  { id: 'yape', label: 'Yape / QR', detail: 'Escanea y confirma', icon: Smartphone },
  { id: 'efectivo', label: 'Efectivo', detail: 'Paga al mesero', icon: Wallet },
  { id: 'mixto', label: 'Mixto', detail: 'Combinar métodos', icon: Layers },
];

interface CheckoutProps {
  pedido: PedidoPublico;
  onClose: () => void;
  onFinished: () => void;
}

export function Checkout({ pedido, onClose, onFinished }: CheckoutProps) {
  const [step, setStep] = useState<'review' | 'pay' | 'success'>('review');
  const [method, setMethod] = useState<MetodoPago>('tarjeta');
  const [tipPct, setTipPct] = useState(10);
  const [folio, setFolio] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rating, setRating] = useState(5);

  useEffect(() => {
    pedirCuenta(pedido.id_pedido)
      .then((cuenta) => setFolio(cuenta.folio))
      .catch(() => setFolio(`UTTOF-${String(pedido.id_pedido).padStart(6, '0')}`));
  }, [pedido.id_pedido]);

  const tip = useMemo(() => Math.round(pedido.total * tipPct) / 100, [pedido.total, tipPct]);
  const total = pedido.total + tip;

  async function handlePay() {
    setError(null);
    setIsProcessing(true);
    try {
      if (method !== 'efectivo') {
        await registrarPago(pedido.id_pedido, method, pedido.total, tip);
      }
      setStep('success');
    } catch {
      setError('No se pudo procesar el pago. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function finishWithReview() {
    try {
      await crearResena({ id_pedido: pedido.id_pedido, calificacion: rating, comentario: 'Experiencia registrada desde el plan estándar' });
    } catch {
      // La reseña es secundaria al cierre del pago.
    }
    onFinished();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
      />
      <motion.aside
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 260 }}
        className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-card border-t shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b px-5 py-4 sticky top-0 bg-card">
          <div className="flex-1">
            <p className="text-xs font-bold text-primary">{folio ?? '—'}</p>
            <h2 className="font-heading text-2xl font-bold">Tu cuenta</h2>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl bg-muted hover:bg-muted/70 transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {step === 'review' && (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <section className="rounded-2xl bg-background border p-4">
                  <h3 className="font-heading text-lg font-semibold mb-3">Consumo</h3>
                  <div className="space-y-2">
                    {pedido.items.map((item) => (
                      <div key={item.id_detalle} className="flex justify-between gap-3 text-sm">
                        <span>
                          {item.qty}x {item.nombre}
                        </span>
                        <span className="font-medium">{formatCurrency(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-4 rounded-2xl bg-background border p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-heading text-lg font-semibold">Propina</h3>
                    <span className="font-bold text-primary">{formatCurrency(tip)}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 10, 15, 20].map((pct) => (
                      <button
                        key={pct}
                        onClick={() => setTipPct(pct)}
                        className={cn(
                          'py-2.5 rounded-xl text-sm font-bold transition',
                          tipPct === pct ? 'bg-primary text-primary-foreground' : 'bg-card border text-muted-foreground hover:bg-muted',
                        )}
                      >
                        {pct === 0 ? 'Sin' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="mt-4 rounded-2xl bg-foreground text-background p-4">
                  <div className="flex justify-between text-sm opacity-70">
                    <span>Subtotal</span>
                    <span>{formatCurrency(pedido.total)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm opacity-70">
                    <span>Propina</span>
                    <span>{formatCurrency(tip)}</span>
                  </div>
                  <div className="mt-3 flex justify-between font-heading text-2xl font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('pay')}
                  className="mt-4 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20"
                >
                  Continuar al pago
                </button>
              </motion.div>
            )}

            {step === 'pay' && (
              <motion.div key="pay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="grid gap-3">
                  {methods.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setMethod(item.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-2xl border p-4 text-left transition',
                        method === item.id ? 'border-primary bg-primary/5' : 'bg-background hover:bg-muted',
                      )}
                    >
                      <span className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center text-primary">
                        <item.icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold">{item.label}</span>
                        <span className="text-xs text-muted-foreground">{item.detail}</span>
                      </span>
                      {method === item.id && <Check className="h-5 w-5 text-primary" />}
                    </button>
                  ))}
                </div>

                {method === 'yape' && (
                  <div className="mt-4 grid place-items-center rounded-2xl bg-background border p-5">
                    <div className="grid h-32 w-32 grid-cols-5 gap-1 rounded-xl bg-card border p-3">
                      {Array.from({ length: 25 }).map((_, index) => (
                        <span key={index} className={cn('rounded-[2px]', (index * 5 + 2) % 3 === 0 ? 'bg-foreground' : 'bg-foreground/10')} />
                      ))}
                    </div>
                    <p className="mt-3 text-sm font-semibold">Escanea y confirma en Yape</p>
                  </div>
                )}

                {method === 'efectivo' && (
                  <div className="mt-4 rounded-2xl bg-status-unpaid/10 text-status-unpaid px-4 py-3 text-sm">
                    El mesero verificará la recepción del efectivo desde su app.
                  </div>
                )}

                {error && <div className="mt-4 rounded-2xl bg-destructive/10 text-destructive px-4 py-3 text-sm">{error}</div>}

                <button
                  onClick={handlePay}
                  disabled={isProcessing}
                  className="mt-4 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20 disabled:opacity-60"
                >
                  {isProcessing ? 'Procesando…' : method === 'efectivo' ? `Confirmar efectivo ${formatCurrency(total)}` : `Pagar ${formatCurrency(total)}`}
                </button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-2">
                <div className="mx-auto w-20 h-20 rounded-full bg-status-paid/15 text-status-paid flex items-center justify-center mb-5">
                  <Check className="h-10 w-10" />
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">
                  {method === 'efectivo' ? 'Pago por verificar' : '¡Gracias por venir!'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-5">
                  {method === 'efectivo'
                    ? 'Tu cuenta queda pendiente hasta que el mesero confirme el efectivo.'
                    : 'Tu pago se registró correctamente.'}
                </p>

                <div className="rounded-2xl bg-background border p-4 text-left mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Folio</span>
                    <span className="font-medium">{folio}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-muted-foreground">Método</span>
                    <span className="font-medium">{methods.find((m) => m.id === method)?.label}</span>
                  </div>
                  <div className="mt-2 flex justify-between font-heading text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>

                <div className="rounded-2xl bg-background border p-4 mb-5">
                  <div className="flex items-center justify-center gap-2 font-heading text-lg font-semibold mb-3">
                    <Sparkles className="h-4 w-4 text-accent" /> Deja tu reseña
                  </div>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center transition',
                          rating >= star ? 'bg-accent text-accent-foreground' : 'bg-card border text-muted-foreground',
                        )}
                      >
                        <Star className="h-4 w-4" fill={rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={finishWithReview}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20"
                >
                  Volver al inicio
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
