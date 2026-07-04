export type OrderStatus = 'espera' | 'cocina' | 'listo' | 'entregado' | 'pagado';

export interface OrderItem {
  qty: number;
  nombre: string;
  nota?: string;
}

export interface KitchenOrder {
  id_pedido: number;
  cliente: string;
  mesa: number;
  estado: OrderStatus;
  minutos: number;
  total: number;
  items: OrderItem[];
}

export interface BoardColumn {
  id: OrderStatus;
  label: string;
  badgeLabel: string;
  accent: 'sun' | 'coral' | 'mint' | 'sky' | 'plum';
  actionLabel?: string;
  actionTone?: 'coral' | 'mint' | 'sky';
  nextStatus?: OrderStatus;
}
