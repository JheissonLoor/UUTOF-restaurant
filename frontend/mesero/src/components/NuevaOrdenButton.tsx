import { Plus } from 'lucide-react';

interface NuevaOrdenButtonProps {
  disabled?: boolean;
  onClick: () => void;
}

export function NuevaOrdenButton({ disabled = false, onClick }: NuevaOrdenButtonProps): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[linear-gradient(180deg,transparent,#FAF6F0_32%)] px-4 pb-[max(20px,env(safe-area-inset-bottom))] pt-5">
      <button
        type="button"
        disabled={disabled}
        className="pointer-events-auto flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-terracotta-500 px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(233,75,51,0.5)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onClick}
      >
        <Plus aria-hidden="true" size={18} strokeWidth={2.4} />
        Nueva orden
      </button>
    </div>
  );
}
