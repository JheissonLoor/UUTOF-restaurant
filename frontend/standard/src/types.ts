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

export interface RegisterRequest extends LoginRequest {
  nombre: string;
  telefono?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  usuario: UsuarioSesion;
}

export interface Categoria {
  id_categoria: number;
  nombre: string;
  orden: number;
}

export interface PlatilloApi {
  id_platillo: number;
  id_categoria: number | null;
  nombre: string;
  precio: number;
  disponible: boolean;
  imagen_url: string | null;
}

export interface PlatillosPage {
  data: PlatilloApi[];
  next_cursor: string | null;
}

// Modelo de UI para la carta (enriquecido con categoría e imagen resueltas).
export interface Dish {
  id_platillo: number;
  id_categoria: number | null;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  disponible: boolean;
}

export interface CartItem {
  id_platillo: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

// ===== Mesas =====
export type EstadoMesa = 'libre' | 'ocupada' | 'reservada' | 'lista' | 'limpieza';
export type ZonaMesa = 'salon' | 'terraza' | 'barra' | 'privado';

export interface MesaPublica {
  id_mesa: number;
  numero: number;
  zona: ZonaMesa;
  capacidad: number;
  estado: EstadoMesa;
}

export interface MesaSession {
  id_mesa: number;
  numero: number;
  zona: ZonaMesa;
  capacidad: number;
}

// ===== Pedidos =====
export type PedidoEstado = 'creado' | 'en_cocina' | 'listo' | 'entregado' | 'pagado' | 'cancelado';
export type EstadoItem = 'en_cocina' | 'ready' | 'delivered';

export interface PedidoCreateResponse {
  id_pedido: number;
  estado: PedidoEstado;
  total: number;
  folio: string;
}

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

export interface PedidoPublico {
  id_pedido: number;
  id_mesa: number;
  estado: PedidoEstado;
  comensales: number;
  total: number;
  items: PedidoItem[];
}

export interface CuentaResponse {
  folio: string;
  qr_url: string;
  total: number;
}

// ===== Pagos =====
export type MetodoPago = 'tarjeta' | 'yape' | 'efectivo' | 'mixto';

export interface PagoResponse {
  id_transaccion: number;
  cambio?: number | null;
  recibo: Record<string, unknown>;
}

// ===== Reservas =====
export interface ReservaPublica {
  id_reserva: number;
  id_usuario?: number | null;
  nombre_cliente: string;
  id_mesa: number;
  hora_reserva: string;
  num_personas: number;
  notas_especiales?: string | null;
}

export interface ReservaCreateRequest {
  id_mesa: number;
  hora_reserva: string;
  num_personas: number;
  notas?: string;
}

// ===== Eventos WebSocket =====
export type WSEvent =
  | { tipo: 'pedido.item_listo'; id_pedido: number; id_detalle: number }
  | { tipo: 'pedido.listo'; id_pedido: number }
  | { tipo: 'pedido.entregado'; id_pedido: number }
  | { tipo: 'pedido.pagado_app'; id_pedido: number; id_mesa?: number }
  | { tipo: 'pago.verificado'; id_pedido: number }
  | { tipo: 'pedido.items_agregados'; id_pedido: number; id_mesa: number }
  | { tipo: 'pong' };
