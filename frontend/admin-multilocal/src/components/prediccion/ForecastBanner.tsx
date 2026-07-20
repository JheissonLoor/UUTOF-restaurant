import { Sparkles } from 'lucide-react';

interface ForecastBannerProps {
  modelo: string;
  confianza: number;
  picos: string[];
  recalculadoEn: string;
  loading?: boolean;
}

function formatRecalculation(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Actualización nocturna';
  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  }).format(date);
}

export function ForecastBanner({
  modelo,
  confianza,
  picos,
  recalculadoEn,
  loading = false,
}: ForecastBannerProps) {
  if (loading) {
    return <div className="h-[150px] animate-pulse rounded-card bg-plum/20" aria-label="Cargando pronóstico" />;
  }

  return (
    <section className="flex min-h-[150px] items-center justify-between gap-6 rounded-card bg-gradient-to-r from-[#2A2138] to-[#3B2B4E] px-7 py-6 text-white shadow-card">
      <div className="flex min-w-0 items-start gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-white/10 text-sun">
          <Sparkles size={23} aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase text-white/55">Predicción UTTOF · {modelo}</p>
          <h2 className="mt-1 font-display text-[25px] font-semibold">Demanda prevista para hoy</h2>
          <p className="mt-2 text-[13px] text-white/70">
            {picos.length > 0 ? `Picos estimados: ${picos.join(' y ')}` : 'Aún no hay suficiente actividad para detectar picos.'}
          </p>
          <p className="mt-1 text-[11px] text-white/45">Recalculado a las {formatRecalculation(recalculadoEn)}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <strong className="block font-display text-[42px] leading-none tabular-nums">{confianza.toFixed(0)}%</strong>
        <span className="mt-1 block font-mono text-[9px] font-semibold uppercase text-white/50">Confianza del modelo</span>
      </div>
    </section>
  );
}
