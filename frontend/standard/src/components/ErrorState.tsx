import { AlertTriangle } from 'lucide-react';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Algo salió mal.', onRetry }: ErrorStateProps) {
  return (
    <div className="container mx-auto px-4 py-20 max-w-md text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-5">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="font-heading text-xl font-bold mb-2">Ups…</h2>
      <p className="text-muted-foreground text-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition shadow-md shadow-primary/20"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
