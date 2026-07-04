import { AxiosError } from 'axios';

import type { ProblemDetails } from '@/types/api';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isProblemDetails(value: unknown): value is ProblemDetails {
  return (
    isRecord(value) &&
    typeof value.type === 'string' &&
    typeof value.title === 'string' &&
    typeof value.status === 'number' &&
    typeof value.detail === 'string' &&
    typeof value.instance === 'string'
  );
}

export function getErrorDetail(error: unknown, fallback: string): string {
  if (error instanceof AxiosError && isProblemDetails(error.response?.data)) {
    return error.response.data.detail;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
