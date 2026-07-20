import { apiClient } from './client';
import type { ApiKeyCreada, ApiKeyResumen, FacturacionConfig, GeneralConfig, IntegracionEmpresa, MarcaConfig } from '../types/multilocal';

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

export async function getMarcaConfig(): Promise<MarcaConfig> {
  const { data } = await apiClient.get<MarcaConfig>('/config/marca');
  return data;
}

export async function updateMarcaConfig(payload: MarcaConfig): Promise<MarcaConfig> {
  const { data } = await apiClient.put<MarcaConfig>('/config/marca', payload);
  return data;
}

export async function getGeneralConfig(): Promise<GeneralConfig> {
  const { data } = await apiClient.get<GeneralConfig>('/config/general');
  return data;
}

export async function updateGeneralConfig(payload: GeneralConfig): Promise<GeneralConfig> {
  const { data } = await apiClient.put<GeneralConfig>('/config/general', payload);
  return data;
}

export async function getFacturacionConfig(): Promise<FacturacionConfig> {
  const { data } = await apiClient.get<FacturacionConfig>('/config/facturacion');
  return data;
}
