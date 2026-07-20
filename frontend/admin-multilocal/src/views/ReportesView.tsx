import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { downloadReporte } from '../api/reportes';
import { getApiErrorMessage } from '../api/errors';
import { DateRangePicker } from '../components/reportes/DateRangePicker';
import { ReportCard } from '../components/reportes/ReportCard';
import { BranchSelector } from '../components/shared/BranchSelector';
import { Toast } from '../components/shared/Toast';
import { useSucursal } from '../context/useSucursal';
import { TopBar } from '../layout/TopBar';
import type { DateRangeSelection, ReporteFormato, ReporteTipo } from '../types/multilocal';

interface ExportRequest {
  type: ReporteTipo;
  format: ReporteFormato;
}

const reports: Array<{ type: ReporteTipo; title: string; description: string }> = [
  { type: 'ventas', title: 'Ventas e ingresos', description: 'Ingresos por día, sucursal y ticket promedio verificado.' },
  { type: 'productos', title: 'Platillos y menú', description: 'Top vendidos y rendimiento comercial de cada plato por local.' },
  { type: 'empleados', title: 'Personal y turnos', description: 'Pedidos atendidos, ventas y propinas del personal de la red.' },
  { type: 'inventario', title: 'Inventario y abastecimiento', description: 'Niveles de stock y estado actual de cada insumo por sucursal.' },
];

const rangeLabels: Record<DateRangeSelection['rango'], string> = {
  hoy: 'Hoy',
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  personalizado: 'Personalizado',
};

export function ReportesView() {
  const { sucursalActiva } = useSucursal();
  const [range, setRange] = useState<DateRangeSelection>({ rango: '7d' });
  const [toast, setToast] = useState<string | null>(null);
  const branchId = sucursalActiva === 'red' ? undefined : sucursalActiva;
  const mutation = useMutation({
    mutationFn: ({ type, format }: ExportRequest) => downloadReporte(type, format, range, branchId),
    onSuccess: (_, request) => setToast(`Reporte ${request.format.toUpperCase()} descargado.`),
  });
  const dateError = useMemo(() => {
    if (range.rango !== 'personalizado') return null;
    if (!range.from || !range.to) return 'Selecciona ambas fechas para exportar.';
    return range.from > range.to ? 'La fecha inicial debe ser anterior a la final.' : null;
  }, [range]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return (
    <section className="animate-view-in" aria-labelledby="titulo-reportes">
      <TopBar
        title="Reportes"
        subtitle="Exporta en PDF o Excel · consolidado o por sucursal"
        titleId="titulo-reportes"
        actions={<BranchSelector />}
      />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-card border border-[#E7DED3] bg-surface px-4 py-3">
        <div>
          <p className="text-[12px] font-semibold text-ink">Periodo del informe</p>
          <p className="mt-0.5 text-[10px] text-ink4">Todos los reportes usarán este rango.</p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </div>
      {dateError ? <p role="alert" className="mb-3 text-right text-xs text-danger">{dateError}</p> : null}
      {mutation.isError ? <p role="alert" className="mb-3 text-right text-xs text-danger">{getApiErrorMessage(mutation.error)}</p> : null}
      <div className="grid grid-cols-2 gap-4 max-[850px]:grid-cols-1">
        {reports.map((report) => (
          <ReportCard
            key={report.type}
            {...report}
            rangeLabel={rangeLabels[range.rango]}
            loadingFormat={mutation.isPending && mutation.variables?.type === report.type ? mutation.variables.format : null}
            onExport={(format) => {
              if (!dateError) mutation.mutate({ type: report.type, format });
            }}
          />
        ))}
      </div>
      <Toast message={toast} onClose={() => setToast(null)} />
    </section>
  );
}
