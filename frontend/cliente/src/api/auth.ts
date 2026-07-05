import axios from 'axios';

import { API_BASE_URL, apiClient } from '@/api/client';
import { saveSession } from '@/auth/session';
import type { LoginRequest, RegisterRequest, TokenResponse, UsuarioSesion } from '@/types';

const demoCliente: RegisterRequest = {
  nombre: 'Cliente UTTOF',
  email: 'cliente@uttof.pe',
  password: 'cliente123',
  telefono: '999000111',
};

export async function login(payload: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', payload);
  return response.data;
}

export async function register(payload: RegisterRequest): Promise<UsuarioSesion> {
  const response = await apiClient.post<UsuarioSesion>('/auth/register', payload);
  return response.data;
}

export async function ensureClienteSession(): Promise<TokenResponse> {
  try {
    const session = await login({ email: demoCliente.email, password: demoCliente.password });
    saveSession(session);
    return session;
  } catch (loginError) {
    if (!axios.isAxiosError(loginError) || loginError.response?.status !== 401) {
      throw loginError;
    }
  }

  try {
    await register(demoCliente);
  } catch (registerError) {
    if (!axios.isAxiosError(registerError) || registerError.response?.status !== 409) {
      throw registerError;
    }
  }

  const session = await login({ email: demoCliente.email, password: demoCliente.password });
  saveSession(session);
  return session;
}

export { API_BASE_URL };
