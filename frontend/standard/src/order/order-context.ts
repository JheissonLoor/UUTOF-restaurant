import { createContext } from 'react';

import type { CartItem, Dish, MesaSession } from '@/types';

export interface OrderContextType {
  // Carrito
  cart: CartItem[];
  cartTotal: number;
  cartCount: number;
  addToCart: (dish: Dish) => void;
  updateQty: (idPlatillo: number, cantidad: number) => void;
  removeFromCart: (idPlatillo: number) => void;
  clearCart: () => void;
  // Mesa
  mesa: MesaSession | null;
  setMesa: (mesa: MesaSession) => void;
  clearMesa: () => void;
  // Pedido activo
  activePedidoId: number | null;
  setActivePedidoId: (idPedido: number | null) => void;
}

export const OrderContext = createContext<OrderContextType | null>(null);
