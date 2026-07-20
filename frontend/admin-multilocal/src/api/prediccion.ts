import { apiClient } from './client';
import type {
  AccionRecomendacion,
  AccionRecomendacionResponse,
  PrediccionResponse,
} from '../types/multilocal';


export async function getPrediccion(idSucursal?: number): Promise<PrediccionResponse> {
  const response = await apiClient.get<PrediccionResponse>('/ia/prediccion', {
    params: idSucursal ? { id_sucursal: idSucursal } : undefined,
  });
  return response.data;
}


export async function applyRecommendation(
  id: string,
  accion: AccionRecomendacion,
  idSucursal?: number,
): Promise<AccionRecomendacionResponse> {
  const response = await apiClient.post<AccionRecomendacionResponse>(
    `/ia/recomendaciones/${encodeURIComponent(id)}/aplicar`,
    { accion, id_sucursal: idSucursal },
  );
  return response.data;
}
