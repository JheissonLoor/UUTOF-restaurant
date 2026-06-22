import { Plus, ReceiptText } from 'lucide-react';

interface DetailFooterProps {
  onAddDishes?: () => void;
  onCharge?: () => void;
}

export function DetailFooter({ onAddDishes, onCharge }: DetailFooterProps): JSX.Element {
  return (
    <footer className="safe-bottom absolute inset-x-0 bottom-0 grid grid-cols-2 gap-2.5 border-t border-[rgba(31,26,20,0.08)] bg-white px-4 pt-3 shadow-[0_-4px_20px_-8px_rgba(31,26,20,0.12)]">
      <button type="button" disabled={!onAddDishes} className="flex h-12 items-center justify-center gap-2 rounded-[14px] border border-[rgba(31,26,20,0.16)] bg-white text-[13.5px] font-semibold text-ink-700 active:scale-[0.98] disabled:opacity-45" onClick={onAddDishes}>
        <Plus aria-hidden="true" size={16} strokeWidth={2.3} />
        Agregar platillo
      </button>
      <button type="button" disabled={!onCharge} className="flex h-12 items-center justify-center gap-2 rounded-[14px] bg-terracotta-500 text-[13.5px] font-semibold text-white shadow-md-soft active:scale-[0.98] disabled:opacity-45" onClick={onCharge}>
        <ReceiptText aria-hidden="true" size={16} />
        Cobrar cuenta
      </button>
    </footer>
  );
}
