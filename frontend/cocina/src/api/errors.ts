import { isAxiosError } from 'axios';

import type { ProblemDetails } from '@/types';

function isProblemDetails(value: unknown): value is ProblemDetails {
  if (typeof value !== 'object' || value === null) return false;
  const problem = value as Partial<ProblemDetails>;
  return typeof problem.detail === 'string';
}

export function getErrorDetail(error: unknown, fallback: string): string {
  if (isAxiosError(error) && isProblemDetails(error.response?.data)) {
    return error.response.data.detail;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
