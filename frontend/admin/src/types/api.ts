export type UserRole = 'cliente' | 'mesero' | 'cocina' | 'admin';

export type PedidoEstado =
  | 'espera'
  | 'preparacion'
  | 'terminado'
  | 'falta_pagar'
  | 'pagado'
  | 'cancelado';

export type MesaEstado = 'libre' | 'ocupada' | 'reservada' | 'limpieza';

export type ActivityType = 'order' | 'pay' | 'ready' | 'reserve' | 'review';

export type AlertLevel = 'urgent' | 'warn' | 'info';

export interface UsuarioAuth {
  id_usuario: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  usuario: UsuarioAuth;
}

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

export interface DashboardDistribucionItem {
  key: PedidoEstado;
  label: string;
  count: number;
}

export interface DashboardIngresosPorDia {
  labels: string[];
  esta_semana: number[];
  semana_anterior: number[];
}

export interface DashboardTopPlatillo {
  id_platillo: number;
  nombre: string;
  categoria: string;
  cantidad: number;
  pct: number;
}

export interface DashboardActividadItem {
  type: ActivityType;
  who: string;
  what: string;
  when: string;
  actor: string;
}

export interface DashboardAlerta {
  level: AlertLevel;
  title: string;
  sub: string;
  accionable?: boolean;
  accion_url?: string;
}

export interface DashboardPagoTipo {
  name: string;
  sub: string;
  amount: number;
  pct: number;
}

export interface DashboardResponse {
  hoy: DashboardHoy;
  distribucion: DashboardDistribucionItem[];
  ingresos_por_dia: DashboardIngresosPorDia;
  top_platillos: DashboardTopPlatillo[];
  actividad: DashboardActividadItem[];
  alertas: DashboardAlerta[];
  pagos_por_tipo: DashboardPagoTipo[];
  heatmap_pedidos: number[][];
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

export interface PlatilloWrite {
  id_categoria: number;
  nombre: string;
  precio: number;
  disponible: boolean;
  imagen_url: string | null;
}

export interface CursorPage<T> {
  data: T[];
  next_cursor: string | null;
}

export interface PedidoActivoMesa {
  id_pedido: number;
  total: number;
  tiempo_min: number;
  comensales: number;
}

export interface Mesa {
  id_mesa: number;
  numero: number;
  capacidad: number;
  estado: MesaEstado;
  pedido_activo?: PedidoActivoMesa;
}

export interface Reserva {
  id_reserva: number;
  id_usuario: number | null;
  nombre_cliente: string;
  id_mesa: number;
  hora_reserva: string;
  num_personas: number;
  notas_especiales: string | null;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono: string | null;
  rol: UserRole;
  creado_en: string;
}

export interface UsuarioCreate {
  nombre: string;
  email: string;
  telefono: string | null;
  password: string;
  rol: UserRole;
}

export interface UsuarioPatch {
  nombre?: string;
  telefono?: string | null;
  rol?: UserRole;
}

export interface VentasReporte {
  ingresos_total: number;
  pedidos_total: number;
  ticket_promedio: number;
  ingresos_por_periodo: Array<{ periodo: string; monto: number }>;
  pedidos_por_periodo: Array<{ periodo: string; cantidad: number }>;
  ticket_promedio_por_periodo: Array<{ periodo: string; monto: number }>;
  top_platillos: Array<{
    id_platillo: number;
    nombre: string;
    cantidad: number;
    ingresos: number;
  }>;
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

export interface Configuracion {
  restaurante: RestauranteConfig;
  pagos: PagosConfig;
  notificaciones: NotificacionesConfig;
  seguridad: SeguridadConfig;
}

export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string[]>;
}
