import { Bell, QrCode } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionsProps {
  onCallKitchen: () => void;
  isCallingKitchen?: boolean;
  onQr: () => void;
  isGeneratingQr?: boolean;
}

interface ActionItem {
  label: string;
  icon: LucideIcon;
  tone: string;
  onClick?: () => void;
}

export function QuickActions({ onCallKitchen, isCallingKitchen = false, onQr, isGeneratingQr = false }: QuickActionsProps): JSX.Element {
  const actions: ActionItem[] = [
    { label: 'Llamar cocina', icon: Bell, tone: 'bg-terracotta-50 text-terracotta-600', onClick: onCallKitchen },
    { label: 'Cuenta QR', icon: QrCode, tone: 'bg-cream-100 text-ink-700', onClick: onQr },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            disabled={(action.label === 'Llamar cocina' && isCallingKitchen) || (action.label === 'Cuenta QR' && isGeneratingQr)}
            className="flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-[14px] border border-[rgba(31,26,20,0.08)] bg-white px-1.5 py-2 text-center transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45"
            onClick={action.onClick}
          >
            <span className={`grid h-9 w-9 place-items-center rounded-[10px] ${action.tone}`}>
              <Icon aria-hidden="true" size={17} strokeWidth={1.8} />
            </span>
            <span className="text-[10.5px] font-semibold leading-tight text-ink-700">
              {action.label === 'Llamar cocina' && isCallingKitchen
                ? 'Enviando...'
                : action.label === 'Cuenta QR' && isGeneratingQr
                  ? 'Generando...'
                  : action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
