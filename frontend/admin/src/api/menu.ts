import { apiClient } from '@/api/client';
import type { Categoria, CursorPage, Platillo, PlatilloWrite } from '@/types/api';

interface PlatilloWire extends Omit<Platillo, 'precio'> {
  precio: number | string;
}

interface PlatillosWirePage {
  data?: PlatilloWire[];
  items?: PlatilloWire[];
  next_cursor: string | number | null;
}

interface GetPlatillosParams {
  categoria_id?: number;
  limit?: number;
  cursor?: string | null;
}

function normalizePlatillo(platillo: PlatilloWire): Platillo {
  return {
    ...platillo,
    precio: Number(platillo.precio),
  };
}

function normalizePage(page: PlatillosWirePage): CursorPage<Platillo> {
  const data = page.data ?? page.items ?? [];

  return {
    data: data.map(normalizePlatillo),
    next_cursor: page.next_cursor === null ? null : String(page.next_cursor),
  };
}

export async function getCategorias(): Promise<Categoria[]> {
  const response = await apiClient.get<Categoria[]>('/menu/categorias');
  return response.data;
}

export async function getPlatillos(params: GetPlatillosParams = {}): Promise<CursorPage<Platillo>> {
  const response = await apiClient.get<PlatillosWirePage>('/menu/platillos', {
    params: {
      categoria_id: params.categoria_id,
      limit: params.limit ?? 50,
      cursor: params.cursor,
    },
  });

  return normalizePage(response.data);
}

export async function createPlatillo(payload: PlatilloWrite): Promise<Platillo> {
  const response = await apiClient.post<PlatilloWire>('/menu/platillos', payload);
  return normalizePlatillo(response.data);
}

export async function updatePlatillo(idPlatillo: number, payload: Partial<PlatilloWrite>): Promise<Platillo> {
  const response = await apiClient.patch<PlatilloWire>(`/menu/platillos/${idPlatillo}`, payload);
  return normalizePlatillo(response.data);
}
