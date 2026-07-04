import { apiClient } from '@/api/client';
import type { Categoria, CursorPage, Platillo } from '@/types/api';

interface PlatilloWire extends Omit<Platillo, 'precio'> {
  precio: number | string;
}

interface PlatillosWirePage {
  data?: PlatilloWire[];
  items?: PlatilloWire[];
  next_cursor: string | number | null;
}

function normalizePlatillo(platillo: PlatilloWire): Platillo {
  return {
    ...platillo,
    precio: Number(platillo.precio),
  };
}

export async function getCategorias(): Promise<Categoria[]> {
  const response = await apiClient.get<Categoria[]>('/menu/categorias');
  return response.data;
}

export async function getPlatillos(categoriaId?: number): Promise<CursorPage<Platillo>> {
  const response = await apiClient.get<PlatillosWirePage>('/menu/platillos', {
    params: {
      categoria_id: categoriaId,
      limit: 50,
    },
  });
  const data = response.data.data ?? response.data.items ?? [];
  return {
    data: data.map(normalizePlatillo),
    next_cursor: response.data.next_cursor === null ? null : String(response.data.next_cursor),
  };
}
