import { API_BASE_URL, apiClient } from '@/api/client';
import type { LoginRequest, RegisterRequest, TokenResponse, UsuarioSesion } from '@/types';

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', payload);
  return response.data;
}

export async function register(payload: RegisterRequest): Promise<UsuarioSesion> {
  const response = await apiClient.post<UsuarioSesion>('/auth/register', payload);
  return response.data;
}

export async function upgradeGuest(payload: RegisterRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/guest/upgrade', payload);
  return response.data;
}

export { API_BASE_URL };
