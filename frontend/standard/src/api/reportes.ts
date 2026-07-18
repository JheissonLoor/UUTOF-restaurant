import { apiClient } from '@/api/client';
import type { DashboardResponse, ReporteVentasResponse } from '@/types';

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>('/reportes/dashboard');
  return response.data;
}

export interface VentasParams {
  from: string;
  to: string;
  granularidad: 'dia' | 'semana' | 'mes';
}

export async function getVentasReporte(params: VentasParams): Promise<ReporteVentasResponse> {
  const response = await apiClient.get<ReporteVentasResponse>('/reportes/ventas', { params });
  return response.data;
}
