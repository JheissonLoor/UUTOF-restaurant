import { Check } from 'lucide-react';

interface PaySuccessProps {
  open: boolean;
  onDone: () => void;
}

export function PaySuccess({ open, onDone }: PaySuccessProps): JSX.Element | null {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[60] grid place-items-center bg-cream-50 px-8 text-center">
      <div>
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-sage-100 text-sage-600 shadow-lg-soft">
          <Check aria-hidden="true" size={42} strokeWidth={3} />
        </div>
        <h2 className="mt-6 font-serif text-[30px] font-semibold text-ink-900">Pago completado</h2>
        <p className="mt-2 text-sm text-ink-500">La mesa quedo libre y el pedido fue cerrado.</p>
        <button type="button" className="mt-6 h-12 rounded-[14px] bg-ink-900 px-6 text-sm font-semibold text-white" onClick={onDone}>
          Volver a mesas
        </button>
      </div>
    </div>
  );
}
