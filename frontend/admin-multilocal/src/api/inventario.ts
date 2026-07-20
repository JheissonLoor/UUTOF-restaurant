import { apiClient } from './client';
import type {
  InventarioItem,
  OrdenCompraRequest,
  OrdenCompraResponse,
} from '../types/multilocal';

export async function getInventario(idSucursal?: number): Promise<InventarioItem[]> {
  const { data } = await apiClient.get<InventarioItem[]>('/inventario', {
    params: idSucursal ? { id_sucursal: idSucursal } : undefined,
  });
  return data;
}

export async function createOrdenCompra(payload: OrdenCompraRequest): Promise<OrdenCompraResponse> {
  const { data } = await apiClient.post<OrdenCompraResponse>('/inventario/orden-compra', payload);
  return data;
}
