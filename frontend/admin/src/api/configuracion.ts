import { apiClient } from '@/api/client';
import type { Configuracion } from '@/types/api';

export async function getConfiguracion(): Promise<Configuracion> {
  const response = await apiClient.get<Configuracion>('/configuracion');
  return response.data;
}

export async function updateConfiguracion(payload: Configuracion): Promise<Configuracion> {
  const response = await apiClient.patch<Configuracion>('/configuracion', payload);
  return response.data;
}
