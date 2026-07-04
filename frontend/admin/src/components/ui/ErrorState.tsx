import { TriangleAlert } from 'lucide-react';

import { Button } from '@/components/ui/Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'No se pudo cargar', message, onRetry }: ErrorStateProps): JSX.Element {
  return (
    <section className="rounded-lg border border-wine-100 bg-white p-6 shadow-sm-soft">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-wine-100 text-wine-500">
          <TriangleAlert aria-hidden="true" size={20} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-serif text-h2 text-ink-900">{title}</h2>
          <p className="mt-1 text-sm text-ink-500">{message}</p>
          {onRetry ? (
            <Button type="button" className="mt-4" onClick={onRetry}>
              Reintentar
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
