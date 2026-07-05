import { useCallback, useMemo, useState } from 'react';

import type { CartItem, Dish } from '@/types';

const KEY = 'uttof_cliente_cart';

function readCart(): CartItem[] {
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    window.localStorage.removeItem(KEY);
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  const update = useCallback((nextItems: CartItem[]) => {
    setItems(nextItems);
    writeCart(nextItems);
  }, []);

  const addDish = useCallback((dish: Dish) => {
    setItems((current) => {
      const found = current.find((item) => item.id_platillo === dish.id_platillo);
      const nextItems = found
        ? current.map((item) => (item.id_platillo === dish.id_platillo ? { ...item, qty: item.qty + 1 } : item))
        : [...current, { ...dish, qty: 1 }];
      writeCart(nextItems);
      return nextItems;
    });
  }, []);

  const removeDish = useCallback((idPlatillo: number) => {
    setItems((current) => {
      const nextItems = current
        .map((item) => (item.id_platillo === idPlatillo ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0);
      writeCart(nextItems);
      return nextItems;
    });
  }, []);

  const clearItem = useCallback((idPlatillo: number) => {
    update(items.filter((item) => item.id_platillo !== idPlatillo));
  }, [items, update]);

  const clearCart = useCallback(() => update([]), [update]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.precio * item.qty, 0), [items]);
  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);

  return { items, subtotal, count, addDish, removeDish, clearItem, clearCart };
}
