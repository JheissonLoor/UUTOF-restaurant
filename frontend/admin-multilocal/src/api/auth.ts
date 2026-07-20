import axios from 'axios';
import type {
  LoginRequest,
  RefreshRequest,
  RefreshResponse,
  TokenResponse,
} from '../types/api';

const authClient = axios.create({
  baseURL: '/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function loginRequest(payload: LoginRequest): Promise<TokenResponse> {
  const { data } = await authClient.post<TokenResponse>('/auth/login', payload);
  return data;
}

export async function refreshRequest(payload: RefreshRequest): Promise<RefreshResponse> {
  const { data } = await authClient.post<RefreshResponse>('/auth/refresh', payload);
  return data;
}
