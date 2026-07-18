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
  pago_estado: 'pendiente' | 'verificado' | null;
  items: PedidoItem[];
}

export interface CuentaResponse {
  folio: string;
  qr_url: string;
  total: number;
}

// ===== Pagos =====
export type MetodoPago = 'tarjeta' | 'yape' | 'efectivo';

export interface PagoResponse {
  id_transaccion: number;
  estado: 'pendiente' | 'verificado';
  cambio?: number | null;
  recibo: Record<string, unknown>;
}

export interface PagoPendiente {
  id_transaccion: number;
  id_pedido: number;
  id_mesa: number;
  numero_mesa: number;
  cliente: string;
  monto: number;
  propina: number;
  total: number;
  fecha: string;
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

// ===== Dashboard (admin) =====
export interface DashboardHoy {
  ingresos: number;
  ingresos_ayer: number;
  pedidos: number;
  pedidos_ayer: number;
  mesas_ocupadas: number;
  mesas_totales: number;
  ticket_promedio: number;
  ticket_promedio_ayer: number;
  pedidos_pendientes: number;
}

export interface DistribucionPedido {
  key: string;
  label: string;
  count: number;
}

export interface DashboardIngresosPorDia {
  labels: string[];
  esta_semana: number[];
  semana_anterior: number[];
}

export interface TopPlatilloDashboard {
  id_platillo: number;
  nombre: string;
  categoria: string | null;
  cantidad: number;
  pct: number;
}

export interface ActividadReciente {
  type: string;
  who: string;
  what: string;
  when: string;
  actor: string;
}

export interface AlertaDashboard {
  level: string;
  title: string;
  sub: string;
  accionable?: boolean | null;
  accion_url?: string | null;
}

export interface PagoPorTipo {
  name: string;
  sub: string;
  amount: number;
  pct: number;
}

export interface DashboardResponse {
  hoy: DashboardHoy;
  distribucion: DistribucionPedido[];
  ingresos_por_dia: DashboardIngresosPorDia;
  top_platillos: TopPlatilloDashboard[];
  actividad: ActividadReciente[];
  alertas: AlertaDashboard[];
  pagos_por_tipo: PagoPorTipo[];
  heatmap_pedidos: number[][];
}

export interface MontoPorPeriodo {
  periodo: string;
  monto: number;
}

export interface CantidadPorPeriodo {
  periodo: string;
  cantidad: number;
}

export interface TopPlatilloVentas {
  id_platillo: number;
  nombre: string;
  cantidad: number;
  ingresos: number;
}

export interface ReporteVentasResponse {
  ingresos_total: number;
  pedidos_total: number;
  ticket_promedio: number;
  ingresos_por_periodo: MontoPorPeriodo[];
  pedidos_por_periodo: CantidadPorPeriodo[];
  ticket_promedio_por_periodo: MontoPorPeriodo[];
  top_platillos: TopPlatilloVentas[];
}

// ===== Admin CRUD =====
export interface PlatilloCreate {
  id_categoria: number;
  nombre: string;
  precio: number;
  disponible: boolean;
  imagen_url?: string | null;
}

export interface PlatilloPatch {
  id_categoria?: number;
  nombre?: string;
  precio?: number;
  disponible?: boolean;
  imagen_url?: string | null;
}

export interface UsuarioPublico {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono?: string | null;
  rol: UserRole;
  creado_en: string;
}

export interface UsuariosPage {
  data: UsuarioPublico[];
  next_cursor: string | null;
}

export interface UsuarioCreate {
  nombre: string;
  email: string;
  telefono?: string;
  password: string;
  rol: UserRole;
}

export interface UsuarioPatch {
  nombre?: string;
  telefono?: string;
  rol?: UserRole;
}

export interface RestauranteConfig {
  nombre_comercial: string;
  ruc: string;
  direccion: string;
  telefono: string;
  email: string;
  timezone: 'America/Lima';
  moneda: 'PEN';
  igv_pct: number;
  horario_apertura: string;
  horario_cierre: string;
}

export interface PagosConfig {
  acepta_efectivo: boolean;
  acepta_tarjeta: boolean;
  acepta_yape: boolean;
  yape_numero: string;
  pos_proveedor: string;
  propina_sugerida_pct: number;
  comprobante_default: 'boleta' | 'factura';
}

export interface NotificacionesConfig {
  email_admin: string;
  email_reservas: boolean;
  alertas_stock_bajo: boolean;
  sonido_cocina: boolean;
  resumen_diario_email: boolean;
}

export interface SeguridadConfig {
  sesion_minutos: number;
  mfa_admin: boolean;
  intentos_login: number;
  bloqueo_minutos: number;
  rotacion_claves_dias: number;
}

export interface ConfiguracionResponse {
  restaurante: RestauranteConfig;
  pagos: PagosConfig;
  notificaciones: NotificacionesConfig;
  seguridad: SeguridadConfig;
}

export interface ConfiguracionPatch {
  restaurante?: Partial<RestauranteConfig>;
  pagos?: Partial<PagosConfig>;
  notificaciones?: Partial<NotificacionesConfig>;
  seguridad?: Partial<SeguridadConfig>;
}

// ===== Cocina / Mesero (paneles de staff) =====
export type EstadoCocina = 'espera' | 'cocina' | 'listo' | 'entregado' | 'pagado';
export type PedidoTransition = 'empezarPreparacion' | 'marcarTerminado' | 'entregarMesa';

export interface KitchenOrderItem {
  id_detalle?: number;
  qty: number;
  nombre: string;
  nota?: string | null;
}

export interface KitchenOrder {
  id_pedido: number;
  cliente: string;
  mesa: number;
  estado: EstadoCocina;
  minutos: number;
  total: number;
  items: KitchenOrderItem[];
}
