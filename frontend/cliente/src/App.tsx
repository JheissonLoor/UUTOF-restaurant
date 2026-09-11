import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '@/auth/useAuth';
import { getMesas } from '@/api/cliente';
import { AppShell } from '@/components/AppShell';
import { CartDrawer } from '@/components/CartDrawer';
import { Checkout } from '@/components/Checkout';
import { Tracker } from '@/components/Tracker';
import { Toast } from '@/components/ui/Toast';
import { useCart } from '@/hooks/useCart';
import { useMesaSession } from '@/hooks/useMesaSession';
import { CheckinConfirm } from '@/pages/CheckinConfirm';
import { DirectMesaPage } from '@/pages/DirectMesa';
import { Inicio } from '@/pages/Inicio';
import { LandingPage } from '@/pages/Landing';
import { LoginPage } from '@/pages/Login';
import { MenuPage } from '@/pages/Menu';
import { Pedidos } from '@/pages/Pedidos';
import { PreferencesPage } from '@/pages/Preferences';
import { ProfilePage } from '@/pages/Profile';
import { RegisterPage } from '@/pages/Register';
import { Reservar } from '@/pages/Reservar';
import { ReservaConfirmPage } from '@/pages/ReservaConfirm';
import { ScanQR } from '@/pages/ScanQR';
import type { AppTab, PedidoPublico } from '@/types';


const tabPaths: Record<AppTab, string> = {
  inicio: '/inicio',
  reservar: '/reservar',
  menu: '/carta',
  pedidos: '/pedidos',
};

export function App(): JSX.Element {
  const { user } = useAuth();
  const { mesa: activeMesa, saveMesa, clearMesa } = useMesaSession();
  const cart = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [cartOpen, setCartOpen] = useState(false);
  const [trackerPedidoId, setTrackerPedidoId] = useState<number | null>(null);
  const [checkoutPedido, setCheckoutPedido] = useState<PedidoPublico | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const activeMesaQuery = useQuery({
    queryKey: ['cliente', 'mesas'],
    queryFn: getMesas,
    enabled: user !== null && activeMesa !== null,
    refetchInterval: 10000,
  });

  useEffect(() => {
    const storedMesa = activeMesa;
    if (!storedMesa || !activeMesaQuery.data) return;
    const currentMesa = activeMesaQuery.data.find((mesa) => mesa.id_mesa === storedMesa.id_mesa);
    if (!currentMesa) {
      clearMesa();
      return;
    }
    if (
      currentMesa.numero !== storedMesa.numero
      || currentMesa.zona !== storedMesa.zona
      || currentMesa.capacidad !== storedMesa.capacidad
      || currentMesa.estado !== storedMesa.estado
    ) {
      saveMesa(currentMesa);
    }
  }, [activeMesa, activeMesaQuery.data, clearMesa, saveMesa]);

  const activeTab = useMemo<AppTab>(() => {
    if (location.pathname.startsWith('/reservar')) return 'reservar';
    if (location.pathname.startsWith('/pedidos')) return 'pedidos';
    if (location.pathname.startsWith('/carta')) return 'menu';
    return 'inicio';
  }, [location.pathname]);

  const experience = (
    <AppShell
      activeTab={activeTab}
      cartCount={cart.count}
      mesa={activeMesa}
      onTabChange={(tab) => navigate(tabPaths[tab])}
      onOpenCart={() => setCartOpen(true)}
      onResetMesa={() => {
        clearMesa();
        cart.clearCart();
        setToast('Sesión de mesa cerrada');
      }}
      onScanMesa={() => navigate('/mesa/escanear')}
      onOpenProfile={() => navigate('/perfil')}
    >
      {activeTab === 'inicio' ? <Inicio nombre={user?.nombre ?? null} onTabChange={(tab) => navigate(tabPaths[tab])} onAddDish={cart.addDish} /> : null}
      {activeTab === 'reservar' ? <Reservar onToast={setToast} /> : null}
      {activeTab === 'menu' ? <MenuPage cart={cart} onOpenCart={() => setCartOpen(true)} /> : null}
      {activeTab === 'pedidos' ? (
        <Pedidos
          onOpenMenu={() => navigate('/carta')}
          onTrack={(idPedido) => setTrackerPedidoId(idPedido)}
        />
      ) : null}
    </AppShell>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/onboarding/preferencias" element={<PreferencesPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/mesa/escanear" element={<ScanQR onCheckedIn={(mesa) => { saveMesa(mesa); navigate('/mesa/confirmar'); }} />} />
        <Route path="/mesa/confirmar" element={activeMesa ? <CheckinConfirm mesa={activeMesa} onOpenMenu={() => navigate('/carta')} onRescan={() => { clearMesa(); navigate('/mesa/escanear'); }} /> : <Navigate to="/mesa/escanear" replace />} />
        <Route path="/mesa/:token" element={<DirectMesaPage onCheckedIn={saveMesa} />} />
        <Route path="/reservas/:token" element={<ReservaConfirmPage />} />
        <Route path="/inicio" element={experience} />
        <Route path="/reservar" element={experience} />
        <Route path="/carta" element={experience} />
        <Route path="/pedidos" element={experience} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <CartDrawer
        cart={cart}
        mesa={activeMesa}
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onNeedMesa={() => { setCartOpen(false); navigate('/mesa/escanear'); }}
        onSent={(pedido) => {
          setCartOpen(false);
          cart.clearCart();
          setTrackerPedidoId(pedido.id_pedido);
          void queryClient.invalidateQueries({ queryKey: ['cliente', 'pedidos', 'mios'] });
          void queryClient.invalidateQueries({ queryKey: ['cliente', 'mesas'] });
          navigate('/pedidos');
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
          clearMesa();
          cart.clearCart();
          void queryClient.invalidateQueries({ queryKey: ['cliente', 'pedidos', 'mios'] });
          void queryClient.invalidateQueries({ queryKey: ['cliente', 'mesas'] });
          navigate('/pedidos');
          setToast('Cuenta procesada');
        }}
      />

      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </>
  );
}
