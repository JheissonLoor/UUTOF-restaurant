import { apiClient } from './client';
import type { MetricasConsolidadoResponse, RangoMetricas } from '../types/multilocal';

export async function getMetricasConsolidado(
  rango: RangoMetricas,
): Promise<MetricasConsolidadoResponse> {
  const { data } = await apiClient.get<MetricasConsolidadoResponse>('/metricas/consolidado', {
    params: { rango },
  });
  return data;
}
