import { useCallback, useMemo, useState, type ReactNode } from 'react';

import { OrderContext, type OrderContextType } from '@/order/order-context';
import type { CartItem, Dish, MesaSession } from '@/types';

const CART_KEY = 'uttof_standard_cart';
const MESA_KEY = 'uttof_standard_mesa';
const PEDIDO_KEY = 'uttof_standard_pedido';

function readJSON<T>(key: string, isValid: (value: unknown) => value is T): T | null {
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : null;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function readCart(): CartItem[] {
  const items = readJSON<CartItem[]>(CART_KEY, (v): v is CartItem[] => Array.isArray(v));
  return items ?? [];
}

function readMesa(): MesaSession | null {
  return readJSON<MesaSession>(
    MESA_KEY,
    (v): v is MesaSession => typeof v === 'object' && v !== null && typeof (v as MesaSession).id_mesa === 'number',
  );
}

function readPedido(): number | null {
  const raw = window.localStorage.getItem(PEDIDO_KEY);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readCart());
  const [mesa, setMesaState] = useState<MesaSession | null>(() => readMesa());
  const [activePedidoId, setActivePedidoIdState] = useState<number | null>(() => readPedido());

  const persistCart = useCallback((next: CartItem[]) => {
    window.localStorage.setItem(CART_KEY, JSON.stringify(next));
    setCart(next);
  }, []);

  const addToCart = useCallback(
    (dish: Dish) => {
      const existing = cart.find((item) => item.id_platillo === dish.id_platillo);
      const next = existing
        ? cart.map((item) => (item.id_platillo === dish.id_platillo ? { ...item, cantidad: item.cantidad + 1 } : item))
        : [...cart, { id_platillo: dish.id_platillo, nombre: dish.nombre, precio: dish.precio, cantidad: 1 }];
      persistCart(next);
    },
    [cart, persistCart],
  );

  const updateQty = useCallback(
    (idPlatillo: number, cantidad: number) => {
      const next =
        cantidad <= 0
          ? cart.filter((item) => item.id_platillo !== idPlatillo)
          : cart.map((item) => (item.id_platillo === idPlatillo ? { ...item, cantidad } : item));
      persistCart(next);
    },
    [cart, persistCart],
  );

  const removeFromCart = useCallback(
    (idPlatillo: number) => persistCart(cart.filter((item) => item.id_platillo !== idPlatillo)),
    [cart, persistCart],
  );

  const clearCart = useCallback(() => persistCart([]), [persistCart]);

  const setMesa = useCallback((next: MesaSession) => {
    window.localStorage.setItem(MESA_KEY, JSON.stringify(next));
    setMesaState(next);
  }, []);

  const clearMesa = useCallback(() => {
    window.localStorage.removeItem(MESA_KEY);
    setMesaState(null);
  }, []);

  const setActivePedidoId = useCallback((idPedido: number | null) => {
    if (idPedido === null) window.localStorage.removeItem(PEDIDO_KEY);
    else window.localStorage.setItem(PEDIDO_KEY, String(idPedido));
    setActivePedidoIdState(idPedido);
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.cantidad, 0), [cart]);

  const value = useMemo<OrderContextType>(
    () => ({
      cart,
      cartTotal,
      cartCount,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      mesa,
      setMesa,
      clearMesa,
      activePedidoId,
      setActivePedidoId,
    }),
    [
      cart,
      cartTotal,
      cartCount,
      addToCart,
      updateQty,
      removeFromCart,
      clearCart,
      mesa,
      setMesa,
      clearMesa,
      activePedidoId,
      setActivePedidoId,
    ],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
