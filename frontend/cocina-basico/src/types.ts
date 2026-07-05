export type OrderStatus = 'espera' | 'cocina' | 'listo' | 'entregado' | 'pagado';
export type PedidoTransition = 'empezarPreparacion' | 'marcarTerminado' | 'entregarMesa';
export type UserRole = 'cliente' | 'mesero' | 'cocina' | 'admin';

export interface OrderItem {
  qty: number;
  nombre: string;
  nota?: string | null;
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

export interface UsuarioSesion {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  usuario: UsuarioSesion;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export interface BoardColumn {
  id: OrderStatus;
  label: string;
  badgeLabel: string;
  accent: 'sun' | 'coral' | 'mint' | 'sky' | 'plum';
  actionLabel?: string;
  actionTone?: 'coral' | 'mint' | 'sky';
  nextStatus?: OrderStatus;
  transition?: PedidoTransition;
}
