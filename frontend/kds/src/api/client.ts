import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

import { clearSession, getAccessToken, getRefreshToken, saveSession } from '@/auth/session'
import type { TokenResponse } from '@/types/api'

export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/v1'
export const WS_BASE_URL = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8000/ws'

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<TokenResponse> | null = null

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

async function refreshSession(refreshToken: string): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(`${API_BASE_URL}/auth/refresh`, {
    refresh_token: refreshToken,
  })
  return response.data
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    if (!config.headers) config.headers = new AxiosHeaders()
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined
    const isRefreshRequest = request?.url?.includes('/auth/refresh') ?? false

    if (error.response?.status !== 401 || !request || request._retry || isRefreshRequest) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearSession()
      return Promise.reject(error)
    }

    request._retry = true
    try {
      if (!refreshPromise) {
        refreshPromise = refreshSession(refreshToken).finally(() => {
          refreshPromise = null
        })
      }
      const nextSession = await refreshPromise
      saveSession(nextSession)
      request.headers.set('Authorization', `Bearer ${nextSession.access_token}`)
      return apiClient(request)
    } catch (refreshError) {
      clearSession()
      return Promise.reject(refreshError)
    }
  },
)
