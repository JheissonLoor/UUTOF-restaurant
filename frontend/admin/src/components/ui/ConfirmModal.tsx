import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps): JSX.Element {
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        onCancel();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/35 px-4" role="presentation">
      <section
        aria-labelledby="confirm-title"
        aria-describedby="confirm-description"
        className="w-full max-w-[420px] rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-5 text-ink-900 shadow-lg-soft"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="confirm-title" className="font-serif text-h2">
              {title}
            </h2>
            <p id="confirm-description" className="mt-2 text-sm text-ink-500">
              {description}
            </p>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-ink-500 transition hover:bg-cream-100 hover:text-ink-900"
            aria-label="Cerrar"
            onClick={onCancel}
          >
            <X aria-hidden="true" size={18} strokeWidth={1.8} />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            className="rounded-md border border-[rgba(42,30,20,0.14)] bg-transparent px-4 py-2 text-sm font-semibold text-ink-900 transition hover:bg-cream-100"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="rounded-md bg-terracotta-500 px-4 py-2 text-sm font-semibold text-white shadow-md-soft transition hover:-translate-y-px hover:bg-terracotta-600"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
