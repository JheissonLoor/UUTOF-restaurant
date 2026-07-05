import { apiClient } from '@/api/client';
import type { LoginRequest, TokenResponse } from '@/types';

export async function loginCocina(payload: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', payload);
  return response.data;
}
