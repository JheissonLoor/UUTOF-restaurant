import { apiClient } from './client';
import type { ApiKeyCreada, ApiKeyResumen, IntegracionEmpresa } from '../types/multilocal';

export async function getIntegraciones(): Promise<IntegracionEmpresa[]> {
  const { data } = await apiClient.get<IntegracionEmpresa[]>('/integraciones');
  return data;
}

export async function connectIntegracion(id: number, apiKey: string): Promise<IntegracionEmpresa> {
  const { data } = await apiClient.post<IntegracionEmpresa>(`/integraciones/${id}/conectar`, { api_key: apiKey });
  return data;
}

export async function disconnectIntegracion(id: number): Promise<void> {
  await apiClient.delete(`/integraciones/${id}/conectar`);
}

export async function getApiKeys(): Promise<ApiKeyResumen[]> {
  const { data } = await apiClient.get<ApiKeyResumen[]>('/api-keys');
  return data;
}

export async function createApiKey(nombre: string): Promise<ApiKeyCreada> {
  const { data } = await apiClient.post<ApiKeyCreada>('/api-keys', { nombre });
  return data;
}

export async function revokeApiKey(id: number): Promise<void> {
  await apiClient.delete(`/api-keys/${id}`);
}
