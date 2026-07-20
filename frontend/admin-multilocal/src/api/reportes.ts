import { apiClient } from './client';
import type { DateRangeSelection, ReporteFormato, ReporteTipo } from '../types/multilocal';


export async function downloadReporte(
  type: ReporteTipo,
  format: ReporteFormato,
  range: DateRangeSelection,
  idSucursal?: number,
): Promise<void> {
  const response = await apiClient.get<Blob>(`/reportes/${type}`, {
    params: {
      rango: range.rango,
      formato: format,
      id_sucursal: idSucursal,
      from: range.rango === 'personalizado' ? range.from : undefined,
      to: range.rango === 'personalizado' ? range.to : undefined,
    },
    responseType: 'blob',
  });
  const disposition = String(response.headers['content-disposition'] ?? '');
  const filename = disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? `uttof_${type}.${format}`;
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
