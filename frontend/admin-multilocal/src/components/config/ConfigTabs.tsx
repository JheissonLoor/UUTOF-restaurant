import { Building2, CreditCard, Link2, Palette } from 'lucide-react';

export type ConfigTab = 'general' | 'integraciones' | 'marca' | 'facturacion';

interface ConfigTabsProps {
  value: ConfigTab;
  onChange: (value: ConfigTab) => void;
  globalAccess?: boolean;
}

const tabs: Array<{ value: ConfigTab; label: string; icon: typeof Building2; global?: boolean }> = [
  { value: 'general', label: 'General', icon: Building2 },
  { value: 'integraciones', label: 'Integraciones', icon: Link2 },
  { value: 'marca', label: 'Marca blanca', icon: Palette, global: true },
  { value: 'facturacion', label: 'Facturación', icon: CreditCard, global: true },
];

export function ConfigTabs({ value, onChange, globalAccess = true }: ConfigTabsProps) {
  const visibleTabs = tabs.filter((tab) => globalAccess || !tab.global);
  return (
    <nav className="mb-5 flex min-h-12 items-center gap-1 overflow-x-auto border-b border-[#DED4C8]" aria-label="Secciones de configuración">
      {visibleTabs.map((tab) => {
        const Icon = tab.icon;
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => onChange(tab.value)}
            className={`relative flex h-12 shrink-0 items-center gap-2 px-4 text-[12px] font-semibold transition-colors ${active ? 'text-ink' : 'text-ink4 hover:text-ink2'}`}
          >
            <Icon size={16} aria-hidden="true" />
            {tab.label}
            {active ? <span className="absolute inset-x-2 bottom-0 h-0.5 bg-coral" /> : null}
          </button>
        );
      })}
    </nav>
  );
}
