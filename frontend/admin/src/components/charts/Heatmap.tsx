interface HeatmapProps {
  data: number[][];
}

const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const hours = [0, 6, 12, 18, 23];

function getCellColor(value: number, max: number): string {
  if (max <= 0 || value <= 0) return '#F4ECE0';

  const ratio = value / max;
  if (ratio > 0.78) return '#E94B33';
  if (ratio > 0.52) return '#F26B53';
  if (ratio > 0.28) return '#F5A593';
  return '#FACFC2';
}

export function Heatmap({ data }: HeatmapProps): JSX.Element {
  const normalized = data.length === 7 ? data : Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  const max = Math.max(...normalized.flat(), 0);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="mb-2 grid grid-cols-[28px_repeat(24,minmax(24px,1fr))] gap-1 text-[11px] text-ink-500">
          <span />
          {Array.from({ length: 24 }).map((_, hour) => (
            <span key={hour} className={hours.includes(hour) ? 'text-center' : 'text-transparent'}>
              {hour}
            </span>
          ))}
        </div>
        <div className="grid gap-1">
          {normalized.map((row, dayIndex) => (
            <div key={dayIndex} className="grid grid-cols-[28px_repeat(24,minmax(24px,1fr))] gap-1">
              <div className="grid place-items-center text-[11px] font-medium text-ink-500">{days[dayIndex]}</div>
              {row.map((value, hour) => (
                <div
                  key={`${dayIndex}-${hour}`}
                  className="h-8 rounded-sm border border-white/70"
                  style={{ background: getCellColor(value, max) }}
                  title={`${days[dayIndex]} ${hour}:00 · ${value} pedidos`}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-end gap-2 text-[11px] text-ink-500">
          Bajo
          <span className="h-2 w-8 rounded-full bg-cream-100" />
          <span className="h-2 w-8 rounded-full bg-terracotta-100" />
          <span className="h-2 w-8 rounded-full bg-terracotta-400" />
          <span className="h-2 w-8 rounded-full bg-terracotta-500" />
          Alto
        </div>
      </div>
    </div>
  );
}
