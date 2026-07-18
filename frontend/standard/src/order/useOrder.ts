import { useContext } from 'react';

import { OrderContext, type OrderContextType } from '@/order/order-context';

export function useOrder(): OrderContextType {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder debe usarse dentro de OrderProvider');
  return ctx;
}
