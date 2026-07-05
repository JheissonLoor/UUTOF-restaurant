export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }): JSX.Element {
  return (
    <div className="rounded-lg border border-coral-100 bg-coral-50 p-4 text-sm text-coral-700">
      <p>{message}</p>
      <button type="button" className="mt-3 min-h-11 rounded-sm bg-cream-surface px-4 font-semibold text-coral-600 shadow-soft" onClick={onRetry}>
        Reintentar
      </button>
    </div>
  );
}
