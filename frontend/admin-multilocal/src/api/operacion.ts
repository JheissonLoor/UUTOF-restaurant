import { apiClient } from './client';
import type {
  CategoriaMenu,
  EmpleadoMultilocal,
  MenuMultilocalItem,
  PlatilloMultilocalCreate,
  PlatilloMultilocalPatch,
} from '../types/multilocal';

export async function getMenuMultilocal(idSucursal?: number): Promise<MenuMultilocalItem[]> {
  const { data } = await apiClient.get<MenuMultilocalItem[]>('/multilocal/menu', {
    params: idSucursal ? { id_sucursal: idSucursal } : undefined,
  });
  return data;
}

export async function getCategoriasMenu(): Promise<CategoriaMenu[]> {
  const { data } = await apiClient.get<CategoriaMenu[]>('/menu/categorias');
  return data;
}

export async function createPlatilloMultilocal(payload: PlatilloMultilocalCreate): Promise<MenuMultilocalItem> {
  const { data } = await apiClient.post<MenuMultilocalItem>('/multilocal/menu/platillos', payload);
  return data;
}

export async function updatePlatilloMultilocal(
  idPlatillo: number,
  payload: PlatilloMultilocalPatch,
): Promise<MenuMultilocalItem> {
  const { data } = await apiClient.patch<MenuMultilocalItem>(`/multilocal/menu/platillos/${idPlatillo}`, payload);
  return data;
}

export async function deletePlatilloMultilocal(idPlatillo: number, idSucursal: number): Promise<void> {
  await apiClient.delete(`/multilocal/menu/platillos/${idPlatillo}`, { params: { id_sucursal: idSucursal } });
}

export async function getEmpleadosMultilocal(idSucursal?: number): Promise<EmpleadoMultilocal[]> {
  const { data } = await apiClient.get<EmpleadoMultilocal[]>('/multilocal/empleados', {
    params: idSucursal ? { id_sucursal: idSucursal } : undefined,
  });
  return data;
}
