import { apiClient } from '@/api/client';
import type { DashboardResponse } from '@/types';

export async function getDashboard(): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>('/reportes/dashboard');
  return response.data;
}
