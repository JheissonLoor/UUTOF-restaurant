import { useState } from 'react';

import { useAuth } from '@/auth/useAuth';
import { AppShell } from '@/components/AppShell';
import { CartDrawer } from '@/components/CartDrawer';
import { Checkout } from '@/components/Checkout';
import { Tracker } from '@/components/Tracker';
import { Toast } from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useMesaSession } from '@/hooks/useMesaSession';
import { CheckinConfirm } from '@/pages/CheckinConfirm';
import { Inicio } from '@/pages/Inicio';
import { MenuPage } from '@/pages/Menu';
import { Pedidos } from '@/pages/Pedidos';
import { Reservar } from '@/pages/Reservar';
import { ScanQR } from '@/pages/ScanQR';
import type { AppTab, PedidoPublico } from '@/types';

export function App(): JSX.Element {
  const { isReady, error } = useAuth();
  const mesaSession = useMesaSession();
  const cart = useCart();
  const [activeTab, setActiveTab] = useState<AppTab>('menu');
  const [showConfirm, setShowConfirm] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [trackerPedidoId, setTrackerPedidoId] = useState<number | null>(null);
  const [checkoutPedido, setCheckoutPedido] = useState<PedidoPublico | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!isReady) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-cream-bg px-6 text-center text-ink-700">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-full bg-coral-100" />
          Preparando tu sesión UTTOF...
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-cream-bg px-6 text-center text-ink-700">
        <div className="max-w-sm rounded-xl bg-cream-surface p-6 shadow-soft">
          <h1 className="font-serif text-2xl font-semibold text-ink-900">No se pudo iniciar Cliente</h1>
          <p className="mt-2 text-sm text-ink-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!mesaSession.mesa) {
    return (
      <ScanQR
        onCheckedIn={(mesa) => {
          mesaSession.saveMesa(mesa);
          setShowConfirm(true);
        }}
      />
    );
  }

  if (showConfirm) {
    return (
      <CheckinConfirm
        mesa={mesaSession.mesa}
        onOpenMenu={() => {
          setShowConfirm(false);
          setActiveTab('menu');
        }}
        onRescan={() => {
          mesaSession.clearMesa();
          setShowConfirm(false);
        }}
      />
    );
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        cartCount={cart.count}
        mesa={mesaSession.mesa}
        onTabChange={setActiveTab}
        onOpenCart={() => setCartOpen(true)}
        onResetMesa={() => {
          mesaSession.clearMesa();
          cart.clearCart();
        }}
      >
        {activeTab === 'inicio' ? <Inicio onTabChange={setActiveTab} onAddDish={cart.addDish} /> : null}
        {activeTab === 'reservar' ? <Reservar onToast={setToast} /> : null}
        {activeTab === 'menu' ? <MenuPage cart={cart} onOpenCart={() => setCartOpen(true)} /> : null}
        {activeTab === 'pedidos' ? (
          <Pedidos
            activePedidoId={trackerPedidoId}
            onOpenMenu={() => setActiveTab('menu')}
            onTrack={(idPedido) => setTrackerPedidoId(idPedido)}
          />
        ) : null}
      </AppShell>

      <CartDrawer
        cart={cart}
        mesa={mesaSession.mesa}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onSent={(pedido) => {
          setCartOpen(false);
          cart.clearCart();
          setTrackerPedidoId(pedido.id_pedido);
          setActiveTab('pedidos');
          setToast('Pedido enviado directo a cocina');
        }}
      />

      <Tracker
        idPedido={trackerPedidoId}
        onClose={() => setTrackerPedidoId(null)}
        onCheckout={(pedido) => {
          setTrackerPedidoId(null);
          setCheckoutPedido(pedido);
        }}
      />

      <Checkout
        pedido={checkoutPedido}
        onClose={() => setCheckoutPedido(null)}
        onFinished={() => {
          setCheckoutPedido(null);
          setActiveTab('pedidos');
          setToast('Cuenta procesada');
        }}
      />

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
