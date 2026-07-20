import axios, {
  AxiosHeaders,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { refreshRequest } from './auth';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from '../auth/session';

interface RetriableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: '/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${accessToken}`);
    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequest | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearSession();
      window.dispatchEvent(new Event('uttof:session-expired'));
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshed = await refreshRequest({ refresh_token: refreshToken });
      updateAccessToken(refreshed.access_token, refreshed.refresh_token);

      const headers = AxiosHeaders.from(originalRequest.headers);
      headers.set('Authorization', `Bearer ${refreshed.access_token}`);
      originalRequest.headers = headers;

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearSession();
      window.dispatchEvent(new Event('uttof:session-expired'));
      return Promise.reject(refreshError);
    }
  },
);
