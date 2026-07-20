import { apiClient } from './client';
import type {
  NuevaSucursalRequest,
  SucursalComparativa,
  SucursalResumen,
} from '../types/multilocal';

export async function getSucursales(): Promise<SucursalResumen[]> {
  const { data } = await apiClient.get<SucursalResumen[]>('/sucursales');
  return data;
}

export async function getSucursalesComparativa(): Promise<SucursalComparativa[]> {
  const { data } = await apiClient.get<SucursalComparativa[]>('/sucursales/comparativa');
  return data;
}

export async function createSucursal(payload: NuevaSucursalRequest): Promise<SucursalResumen> {
  const { data } = await apiClient.post<SucursalResumen>('/sucursales', payload);
  return data;
}
