interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-md border border-coral-100 bg-coral-50 px-4 py-3 text-sm text-coral-600" role="alert">
      <span>{message}</span>
      <button type="button" className="rounded-sm bg-cream-surface px-3 py-2 text-[13px] font-semibold text-coral-600 shadow-soft" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}
