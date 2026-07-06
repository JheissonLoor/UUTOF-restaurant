import { AxiosError } from 'axios'

import type { ProblemDetails } from '@/types/api'

function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<ProblemDetails>
  return typeof candidate.detail === 'string' && typeof candidate.status === 'number'
}

export function getErrorDetail(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && isProblemDetails(error.response?.data)) {
    return error.response.data.detail
  }
  if (error instanceof Error) return error.message
  return fallback
}
