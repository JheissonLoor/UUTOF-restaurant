export type UserRole = 'cliente' | 'mesero' | 'cocina' | 'admin'
export type BackendOrderStatus = 'espera' | 'cocina' | 'listo' | 'entregado' | 'pagado'
export type TicketStatus = 'new' | 'cooking' | 'urgent' | 'ready'
export type PedidoTransition = 'empezarPreparacion' | 'marcarTerminado' | 'entregarMesa'

export interface UsuarioSesion {
  id_usuario: number
  nombre: string
  email: string
  rol: UserRole
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  usuario: UsuarioSesion
}

export interface ProblemDetails {
  type: string
  title: string
  status: number
  detail: string
  instance: string
}

export interface BackendKitchenItem {
  qty: number
  nombre: string
  nota?: string | null
}

export interface BackendKitchenOrder {
  id_pedido: number
  cliente: string
  mesa: number
  estado: BackendOrderStatus
  minutos: number
  total: number
  items: BackendKitchenItem[]
}

export interface TicketItem {
  id: string
  id_detalle?: number
  qty: number
  nombre: string
  modificadores: string[]
  nota?: string | null
  alergenos: string[]
  done: boolean
}

export interface KitchenTicket {
  id_pedido: number
  num: number
  mesa: string
  origen: 'app_cliente' | 'mesero'
  mesero: string
  estado: TicketStatus
  estado_backend: BackendOrderStatus
  creado_en: string
  target_seg: number
  total: number
  items: TicketItem[]
}

export type WSEvent =
  | { tipo: 'pedido.creado'; pedido?: KitchenTicket }
  | { tipo: 'pedido.items_agregados'; id_pedido: number; id_mesa?: number; items?: TicketItem[] }
  | { tipo: 'pedido.cancelado'; id_pedido: number }
  | { tipo: 'pedido.listo'; id_pedido: number }
  | { tipo: string; [key: string]: unknown }
