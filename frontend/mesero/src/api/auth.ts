import { apiClient } from '@/api/client';
import type { LoginRequest, TokenResponse } from '@/types/api';

export async function loginMesero(payload: LoginRequest): Promise<TokenResponse> {
  const response = await apiClient.post<TokenResponse>('/auth/login', payload);
  return response.data;
}
