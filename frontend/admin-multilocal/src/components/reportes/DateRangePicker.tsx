import { CalendarDays } from 'lucide-react';
import type { DateRangeSelection, RangoReporte } from '../../types/multilocal';

interface DateRangePickerProps {
  value: DateRangeSelection;
  onChange: (value: DateRangeSelection) => void;
}

const options: Array<{ value: RangoReporte; label: string }> = [
  { value: 'hoy', label: 'Hoy' },
  { value: '7d', label: '7 días' },
  { value: '30d', label: '30 días' },
  { value: 'personalizado', label: 'Personalizado' },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Rango del reporte">
      <div className="flex h-10 items-center rounded-card border border-[#DED4C8] bg-surface p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value.rango === option.value}
            onClick={() => onChange({ rango: option.value, from: value.from, to: value.to })}
            className={`h-8 rounded-card px-3 text-[11px] font-semibold transition-colors ${
              value.rango === option.value ? 'bg-ink text-white' : 'text-ink3 hover:bg-bg'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
      {value.rango === 'personalizado' ? (
        <div className="flex items-center gap-2 rounded-card border border-[#DED4C8] bg-surface px-2">
          <CalendarDays size={15} className="text-ink4" aria-hidden="true" />
          <label className="flex items-center gap-1 text-[10px] font-semibold text-ink4">
            Desde
            <input
              type="date"
              value={value.from ?? ''}
              max={value.to}
              onChange={(event) => onChange({ ...value, from: event.target.value })}
              className="h-9 border-0 bg-transparent p-1 text-[11px] text-ink2 outline-none"
            />
          </label>
          <span className="h-5 w-px bg-[#E7DED3]" />
          <label className="flex items-center gap-1 text-[10px] font-semibold text-ink4">
            Hasta
            <input
              type="date"
              value={value.to ?? ''}
              min={value.from}
              onChange={(event) => onChange({ ...value, to: event.target.value })}
              className="h-9 border-0 bg-transparent p-1 text-[11px] text-ink2 outline-none"
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
