import axios from 'axios';

import { API_BASE_URL, apiClient } from '@/api/client';
import { clearSession, saveSession } from '@/auth/session';
import type { LoginRequest, RefreshRequest, TokenResponse } from '@/types/api';

export async function login(email: string, password: string): Promise<TokenResponse> {
  const payload: LoginRequest = { email, password };
  const response = await apiClient.post<TokenResponse>('/auth/login', payload);
  saveSession(response.data);
  return response.data;
}

export async function refresh(token: string): Promise<TokenResponse> {
  const payload: RefreshRequest = { refresh_token: token };
  const response = await axios.post<TokenResponse>(`${API_BASE_URL}/auth/refresh`, payload, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  saveSession(response.data);
  return response.data;
}

export function logout(): void {
  clearSession();
}
