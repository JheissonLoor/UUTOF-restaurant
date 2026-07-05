import { useState } from 'react';

import { enviarPedido } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { CloseIcon, FlameIcon, MinusIcon, PlusIcon } from '@/components/icons';
import { formatCurrency } from '@/lib/format';
import type { CartItem, MesaSession, PedidoCreateResponse } from '@/types';

interface CartState {
  items: CartItem[];
  subtotal: number;
  addDish: (dish: CartItem) => void;
  removeDish: (idPlatillo: number) => void;
  clearItem: (idPlatillo: number) => void;
}

interface CartDrawerProps {
  open: boolean;
  mesa: MesaSession;
  cart: CartState;
  onClose: () => void;
  onSent: (pedido: PedidoCreateResponse) => void;
}

export function CartDrawer({ open, mesa, cart, onClose, onSent }: CartDrawerProps): JSX.Element | null {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSend(): Promise<void> {
    setError(null);
    setIsSending(true);
    try {
      const pedido = await enviarPedido(mesa.id_mesa, cart.items);
      onSent(pedido);
    } catch (sendError) {
      setError(getErrorDetail(sendError, 'No se pudo enviar el pedido a cocina.'));
    } finally {
      setIsSending(false);
    }
  }

  const tipPreview = Math.round(cart.subtotal * 0.1);

  return (
    <>
      <button type="button" className="fixed inset-0 z-50 bg-ink-900/35" onClick={onClose} aria-label="Cerrar carrito" />
      <aside className="fixed inset-x-0 bottom-0 z-[60] mx-auto max-h-[86dvh] max-w-[440px] overflow-hidden rounded-t-2xl bg-cream-surface shadow-[0_-18px_48px_-18px_rgba(31,26,20,0.45)] animate-pop-in">
        <header className="flex items-center gap-3 border-b border-[rgba(31,26,20,0.08)] px-4 py-4">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-coral-50 text-coral-600">
            <FlameIcon size={18} />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-xl font-semibold text-ink-900">Tu pedido</h2>
            <p className="text-xs text-ink-500">Mesa {mesa.numero} · postpago al final</p>
          </div>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-sm bg-cream-bg2 text-ink-500" onClick={onClose}>
            <CloseIcon size={18} />
          </button>
        </header>

        <div className="max-h-[52dvh] overflow-y-auto px-4 py-4">
          {cart.items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-serif text-xl font-semibold text-ink-900">Carrito vacío</p>
              <p className="mt-2 text-sm text-ink-500">Agrega platos de la carta para enviarlos a cocina.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id_platillo} className="flex gap-3 rounded-lg border border-[rgba(31,26,20,0.08)] bg-cream-bg p-2">
                  <div className="h-20 w-20 shrink-0 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${item.imagen_url})` }} />
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-ink-900">{item.nombre}</div>
                    <div className="mt-1 text-xs text-ink-500">{formatCurrency(item.precio)} c/u</div>
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-sm bg-cream-surface" onClick={() => cart.removeDish(item.id_platillo)}>
                        <MinusIcon size={14} />
                      </button>
                      <span className="w-5 text-center font-mono text-sm font-bold tnum">{item.qty}</span>
                      <button type="button" className="grid h-9 w-9 place-items-center rounded-sm bg-coral text-white" onClick={() => cart.addDish(item)}>
                        <PlusIcon size={14} />
                      </button>
                      <button type="button" className="ml-auto min-h-9 px-2 text-xs font-semibold text-ink-400" onClick={() => cart.clearItem(item.id_platillo)}>
                        Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-[rgba(31,26,20,0.08)] px-4 py-4">
          {error ? <div className="mb-3 rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-600">{error}</div> : null}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-500"><span>Subtotal</span><span className="tnum">{formatCurrency(cart.subtotal)}</span></div>
            <div className="flex justify-between text-ink-500"><span>Propina sugerida al final</span><span className="tnum">{formatCurrency(tipPreview)}</span></div>
            <div className="flex justify-between font-serif text-xl font-bold text-ink-900"><span>Total consumo</span><span className="tnum">{formatCurrency(cart.subtotal)}</span></div>
          </div>
          <button
            type="button"
            disabled={cart.items.length === 0 || isSending}
            className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-coral px-4 text-sm font-semibold text-white shadow-[0_8px_20px_-8px_rgba(233,75,51,0.5)] disabled:bg-ink-400"
            onClick={() => void handleSend()}
          >
            <FlameIcon size={16} />
            {isSending ? 'Enviando...' : 'Enviar a cocina'}
          </button>
        </footer>
      </aside>
    </>
  );
}
