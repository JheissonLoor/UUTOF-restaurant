import { apiClient } from '@/api/client';
import type { CursorPage, UserRole, Usuario, UsuarioCreate, UsuarioPatch } from '@/types/api';

interface GetUsuariosParams {
  rol?: UserRole;
  limit?: number;
  cursor?: string;
}

export async function getUsuarios(params: GetUsuariosParams = {}): Promise<CursorPage<Usuario>> {
  const response = await apiClient.get<CursorPage<Usuario>>('/usuarios', {
    params: {
      rol: params.rol,
      limit: params.limit ?? 50,
      cursor: params.cursor,
    },
  });

  return response.data;
}

export async function createUsuario(payload: UsuarioCreate): Promise<Usuario> {
  const response = await apiClient.post<Usuario>('/usuarios', payload);
  return response.data;
}

export async function updateUsuario(idUsuario: number, payload: UsuarioPatch): Promise<Usuario> {
  const response = await apiClient.patch<Usuario>(`/usuarios/${idUsuario}`, payload);
  return response.data;
}
