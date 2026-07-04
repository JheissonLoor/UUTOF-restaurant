import { apiClient } from '@/api/client';
import type { DashboardResponse, VentasReporte } from '@/types/api';

export type ReporteGranularidad = 'dia' | 'semana' | 'mes';

interface GetVentasParams {
  from: string;
  to: string;
  granularidad: ReporteGranularidad;
}

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>('/reportes/dashboard');
  return response.data;
}

export async function getVentasReporte(params: GetVentasParams): Promise<VentasReporte> {
  const response = await apiClient.get<VentasReporte>('/reportes/ventas', { params });
  return response.data;
}
