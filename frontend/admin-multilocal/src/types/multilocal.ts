export type RangoMetricas = 'hoy' | '7d' | '30d';
export type EstadoInventario = 'ok' | 'bajo' | 'critico';

export interface MetricasDelta {
  ingresos: number;
  pedidos: number;
  ticket_prom: number;
  ocupacion: number;
}

export interface ConsolidadoKpis {
  ingresos: number;
  pedidos: number;
  ticket_prom: number;
  ocupacion: number;
  delta: MetricasDelta;
}

export interface RendimientoSucursal {
  id_sucursal: number;
  nombre: string;
  color: string;
  ingresos: number;
  pedidos: number;
  ocupacion: number;
  inventario_estado: EstadoInventario;
  delta_semana: number;
}

export interface MetricasConsolidadoResponse {
  kpis: ConsolidadoKpis;
  por_sucursal: RendimientoSucursal[];
}

export interface SucursalResumen {
  id_sucursal: number;
  nombre: string;
  direccion: string;
  color: string;
  mesas: number;
  activa: boolean;
}

export interface NuevaSucursalRequest {
  nombre: string;
  direccion: string;
  color: 'coral' | 'mint' | 'sky' | 'plum' | 'sun';
  mesas: number;
}

export interface SucursalComparativa {
  id_sucursal: number;
  nombre: string;
  color: string;
  ingresos_semana: number;
  ticket_promedio: number;
  resenas_promedio: number | null;
  empleados: number;
  margen_pct: number | null;
}

export interface InventarioItem {
  id_insumo: number;
  nombre: string;
  descripcion?: string | null;
  id_sucursal: number;
  sucursal: string;
  color: string;
  nivel_pct: number;
  stock: string;
  estado: EstadoInventario;
  sugerido: string;
}

export interface OrdenCompraRequest {
  id_sucursal: number;
  items: Array<{ id_insumo: number; cantidad: string }>;
}

export interface OrdenCompraResponse {
  id_orden: number;
  id_sucursal: number;
  estado: 'generada';
  items: number;
}
