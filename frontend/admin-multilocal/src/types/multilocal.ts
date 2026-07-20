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
