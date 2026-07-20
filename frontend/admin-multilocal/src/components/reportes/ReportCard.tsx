import { Boxes, FileSpreadsheet, FileText, LoaderCircle, TrendingUp, Utensils, Users } from 'lucide-react';
import type { ReporteFormato, ReporteTipo } from '../../types/multilocal';

interface ReportCardProps {
  type: ReporteTipo;
  title: string;
  description: string;
  rangeLabel: string;
  loadingFormat?: ReporteFormato | null;
  onExport: (format: ReporteFormato) => void;
}

const iconByType: Record<ReporteTipo, typeof TrendingUp> = {
  ventas: TrendingUp,
  productos: Utensils,
  empleados: Users,
  inventario: Boxes,
};

const colorByType: Record<ReporteTipo, string> = {
  ventas: 'bg-coral/10 text-coral-dark',
  productos: 'bg-mint/10 text-mint-dark',
  empleados: 'bg-sky/10 text-sky-dark',
  inventario: 'bg-sun/15 text-sun-dark',
};

export function ReportCard({
  type,
  title,
  description,
  rangeLabel,
  loadingFormat = null,
  onExport,
}: ReportCardProps) {
  const Icon = iconByType[type];
  return (
    <article className="rounded-card border border-[#E7DED3] bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <span className={`flex h-11 w-11 items-center justify-center rounded-card ${colorByType[type]}`}>
          <Icon size={21} aria-hidden="true" />
        </span>
        <span className="rounded-full bg-bg px-2.5 py-1 font-mono text-[9px] font-semibold uppercase text-ink4">{rangeLabel}</span>
      </div>
      <h3 className="mt-4 font-display text-[19px] font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 min-h-10 text-[12px] leading-5 text-ink3">{description}</p>
      <div className="mt-5 flex gap-2">
        <button
          type="button"
          disabled={Boolean(loadingFormat)}
          onClick={() => onExport('pdf')}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-card border border-[#DED4C8] text-[11px] font-semibold text-ink2 hover:bg-bg disabled:opacity-50"
        >
          {loadingFormat === 'pdf' ? <LoaderCircle size={15} className="animate-spin" /> : <FileText size={15} />}
          PDF
        </button>
        <button
          type="button"
          disabled={Boolean(loadingFormat)}
          onClick={() => onExport('xlsx')}
          className="flex h-10 flex-1 items-center justify-center gap-2 rounded-card bg-ink text-[11px] font-semibold text-white hover:bg-ink2 disabled:opacity-50"
        >
          {loadingFormat === 'xlsx' ? <LoaderCircle size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
          Excel
        </button>
      </div>
    </article>
  );
}
