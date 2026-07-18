import { QRCodeSVG } from 'qrcode.react';

import { Sheet } from '@/components/sheets/Sheet';
import type { CuentaResponse } from '@/types/api';

interface CuentaQrSheetProps {
  open: boolean;
  cuenta: CuentaResponse | null;
  onClose: () => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value);
}

export function CuentaQrSheet({ open, cuenta, onClose }: CuentaQrSheetProps): JSX.Element | null {
  if (!cuenta) return null;

  return (
    <Sheet title="Cuenta QR" open={open} onClose={onClose}>
      <div className="px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-4 text-center">
        <div className="mx-auto w-fit rounded-[18px] border border-[rgba(31,26,20,0.08)] bg-white p-4 shadow-sm-soft">
          <QRCodeSVG value={cuenta.qr_url} size={184} level="M" fgColor="#1F1A14" bgColor="#FFFFFF" />
        </div>
        <p className="mt-4 font-mono text-xs font-bold text-terracotta-600">{cuenta.folio}</p>
        <p className="mt-1 font-serif text-[28px] font-semibold text-ink-900">{formatCurrency(cuenta.total)}</p>
        <p className="mx-auto mt-2 max-w-[280px] text-sm leading-6 text-ink-500">
          El cliente puede escanear este código para identificar su cuenta desde la App Cliente.
        </p>
        <button type="button" className="mt-5 h-12 w-full rounded-[14px] bg-ink-900 text-sm font-semibold text-white" onClick={onClose}>
          Listo
        </button>
      </div>
    </Sheet>
  );
}
