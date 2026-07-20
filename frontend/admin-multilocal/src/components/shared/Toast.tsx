import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export function Toast({ message, onClose }: ToastProps) {
  if (!message) {
    return null;
  }

  return (
    <div role="status" className="fixed bottom-6 right-6 z-50 flex min-h-12 max-w-sm items-center gap-3 rounded-card bg-ink px-4 py-3 text-sm text-white shadow-lift">
      <CheckCircle2 size={18} className="shrink-0 text-mint" aria-hidden="true" />
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        title="Cerrar"
        className="flex h-8 w-8 items-center justify-center rounded-card text-white/60 hover:bg-white/10 hover:text-white"
      >
        <X size={15} aria-hidden="true" />
      </button>
    </div>
  );
}
