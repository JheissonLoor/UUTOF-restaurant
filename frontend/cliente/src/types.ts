export type UserRole = 'cliente' | 'mesero' | 'cocina' | 'admin';
export type AppTab = 'inicio' | 'reservar' | 'menu' | 'pedidos';
export type PedidoEstado = 'creado' | 'en_cocina' | 'listo' | 'entregado' | 'pagado' | 'cancelado';
export type EstadoItem = 'en_cocina' | 'ready' | 'delivered';
export type MetodoPago = 'tarjeta' | 'yape' | 'efectivo';

export interface UsuarioSesion {
  id_usuario: number;
  nombre: string;
  email: string | null;
  rol: UserRole;
  telefono?: string | null;
  es_invitado: boolean;
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

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
}

export interface MesaSession {
  id_mesa: number;
  numero: number;
  zona: string;
  capacidad: number;
  estado?: MesaEstado;
}

export type MesaEstado = 'libre' | 'ocupada' | 'reservada' | 'limpieza' | 'lista';

export interface MesaPublica extends MesaSession {
  estado: MesaEstado;
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

export interface Dish {
  id_platillo: number;
  id_categoria: number | null;
  categoria: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  tiempo_prep: number;
  disponible: boolean;
}

export interface CartItem extends Dish {
  qty: number;
  nota?: string;
}

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
  creado_en: string;
  estado: PedidoEstado;
  comensales: number;
  total: number;
  pago_estado: 'pendiente' | 'verificado' | null;
  items: PedidoItem[];
}

export interface CuentaResponse {
  folio: string;
  qr_url: string;
  total: number;
}

export interface PagoResponse {
  id_transaccion: number;
  estado: 'pendiente' | 'verificado';
  cambio?: number | null;
  recibo: Record<string, unknown>;
}

export interface ReservaPublica {
  id_reserva: number;
  folio: string;
  id_usuario?: number | null;
  nombre_cliente: string;
  id_mesa: number;
  hora_reserva: string;
  num_personas: number;
  notas_especiales?: string | null;
  estado: 'confirmada' | 'validada' | 'cancelada' | 'completada';
  qr_url: string;
  creado_en: string;
}

export interface ReservaDisponibilidad {
  id_mesa: number;
  hora_reserva: string;
}

export interface MesaQrCheckinResponse {
  mesa: MesaSession;
  sesion: TokenResponse;
}

export type DietaCliente = 'sin_restricciones' | 'vegetariana' | 'vegana' | 'sin_gluten';
export type CocinaFavorita = 'criolla' | 'marina' | 'parrilla' | 'chifa' | 'nikkei' | 'postres' | 'vegetariana' | 'picante';

export interface PreferenciasCliente {
  dieta: DietaCliente;
  cocinas: CocinaFavorita[];
  actualizado_en?: string | null;
}

export interface ConfiguracionPublica {
  restaurante: {
    nombre_comercial: string;
    direccion: string;
    telefono: string;
    email: string;
    timezone: 'America/Lima';
    moneda: 'PEN';
    horario_apertura: string;
    horario_cierre: string;
  };
  pagos: {
    acepta_efectivo: boolean;
    acepta_tarjeta: boolean;
    acepta_yape: boolean;
  };
}

export type WSEvent =
  | { tipo: 'pedido.item_listo'; id_pedido: number; id_detalle: number }
  | { tipo: 'pedido.listo'; id_pedido: number }
  | { tipo: 'pedido.entregado'; id_pedido: number }
  | { tipo: 'pedido.pagado_app'; id_pedido: number; id_mesa?: number }
  | { tipo: 'pago.efectivo_pendiente'; id_pedido: number; id_mesa: number }
  | { tipo: 'pago.verificado'; id_pedido: number; id_mesa?: number }
  | { tipo: 'pedido.items_agregados'; id_pedido: number; id_mesa: number }
  | { tipo: 'pong' };
