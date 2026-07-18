import { apiClient } from '@/api/client';
import type {
  ConfiguracionPatch,
  ConfiguracionResponse,
  MesaPublica,
  EstadoMesa,
  PlatilloApi,
  PlatilloCreate,
  PlatilloPatch,
  PlatillosPage,
  UsuarioCreate,
  UsuarioPatch,
  UsuarioPublico,
  UsuariosPage,
} from '@/types';

// ===== Menú =====
export async function getPlatillosAdmin(): Promise<PlatilloApi[]> {
  const response = await apiClient.get<PlatillosPage>('/menu/platillos', { params: { limit: 100 } });
  return response.data.data;
}

export async function crearPlatillo(payload: PlatilloCreate): Promise<PlatilloApi> {
  const response = await apiClient.post<PlatilloApi>('/menu/platillos', payload);
  return response.data;
}

export async function actualizarPlatillo(id: number, payload: PlatilloPatch): Promise<PlatilloApi> {
  const response = await apiClient.patch<PlatilloApi>(`/menu/platillos/${id}`, payload);
  return response.data;
}

// ===== Mesas =====
export async function cambiarEstadoMesa(idMesa: number, estado: EstadoMesa): Promise<MesaPublica> {
  const response = await apiClient.patch<MesaPublica>(`/mesas/${idMesa}/estado`, { estado });
  return response.data;
}

// ===== Usuarios =====
export async function getUsuarios(): Promise<UsuarioPublico[]> {
  const response = await apiClient.get<UsuariosPage>('/usuarios', { params: { limit: 100 } });
  return response.data.data;
}

export async function crearUsuario(payload: UsuarioCreate): Promise<UsuarioPublico> {
  const response = await apiClient.post<UsuarioPublico>('/usuarios', payload);
  return response.data;
}

export async function actualizarUsuario(id: number, payload: UsuarioPatch): Promise<UsuarioPublico> {
  const response = await apiClient.patch<UsuarioPublico>(`/usuarios/${id}`, payload);
  return response.data;
}

// ===== Configuración =====
export async function getConfiguracion(): Promise<ConfiguracionResponse> {
  const response = await apiClient.get<ConfiguracionResponse>('/configuracion');
  return response.data;
}

export async function actualizarConfiguracion(payload: ConfiguracionPatch): Promise<ConfiguracionResponse> {
  const response = await apiClient.patch<ConfiguracionResponse>('/configuracion', payload);
  return response.data;
}
