import axios from 'axios';
import type { ProblemDetails } from '../types/api';

export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError<ProblemDetails>(error)) {
    return 'Ocurrió un error inesperado. Intenta nuevamente.';
  }

  const problem = error.response?.data;
  return problem?.detail ?? problem?.title ?? 'No fue posible completar la solicitud.';
}
