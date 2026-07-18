export type UserRole = 'cliente' | 'mesero' | 'cocina' | 'admin';

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

export type ZonaMesa = 'salon' | 'terraza' | 'barra' | 'privado';
export type MesaEstado = 'libre' | 'ocupada' | 'reservada' | 'lista' | 'limpieza';

export interface PedidoActivoMesa {
  id_pedido: number;
  comensales: number;
  abierto_en: string;
  minutos: number;
  total: number;
  curso_actual: string;
  items_count: number;
  en_cocina: number;
  alerta: number;
  progreso: string;
}

export interface Mesa {
  id_mesa: number;
  numero: number;
  zona: ZonaMesa | null;
  capacidad: number;
  estado: MesaEstado;
  pedido_activo?: PedidoActivoMesa;
}

export interface MesaApiResponse extends Omit<Mesa, 'zona'> {
  zona?: ZonaMesa;
}

export type PedidoEstado = 'creado' | 'en_cocina' | 'listo' | 'entregado' | 'pagado' | 'cancelado';
export type EstadoItem = 'en_cocina' | 'ready' | 'delivered';

export interface PedidoItem {
  id_detalle: number;
  id_platillo: number;
  nombre: string;
  qty: number;
  price: number;
  nota: string | null;
  curso: string;
  estado_item: EstadoItem;
}

export interface Pedido {
  id_pedido: number;
  id_mesa: number;
  estado: PedidoEstado;
  comensales: number;
  total: number;
  pago_estado: 'pendiente' | 'verificado' | null;
  items: PedidoItem[];
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  orden: number;
}

export interface Platillo {
  id_platillo: number;
  id_categoria: number | null;
  nombre: string;
  precio: number;
  disponible: boolean;
  imagen_url: string | null;
}

export interface CursorPage<T> {
  data: T[];
  next_cursor: string | null;
}

export interface PedidoItemWrite {
  id_platillo: number;
  qty: number;
  nota?: string;
  modificadores?: {
    temp?: string;
    guarnicion?: string;
  };
}

export type MetodoPago = 'tarjeta' | 'yape' | 'efectivo' | 'mixto';

export interface PagoRequest {
  id_pedido: number;
  metodo: MetodoPago;
  monto: number;
  propina: number;
  recibido?: number;
}

export interface PagoResponse {
  id_transaccion: number;
  estado: 'pendiente' | 'verificado';
  cambio?: number;
  recibo: Record<string, unknown>;
}

export type WSEvent =
  | { tipo: 'pedido.listo'; id_pedido: number; id_mesa: number }
  | { tipo: 'pedido.item_listo'; id_pedido: number; id_detalle: number }
  | { tipo: 'pedido.pagado_app'; id_pedido: number; id_mesa: number }
  | { tipo: 'pago.efectivo_pendiente'; id_pedido: number; id_mesa: number }
  | { tipo: 'pago.verificado'; id_pedido: number; id_mesa: number }
  | { tipo: 'mesa.checkin'; id_mesa: number; comensales: number };

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}
