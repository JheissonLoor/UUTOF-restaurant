import { CircleOff } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps): JSX.Element {
  return (
    <div className="grid min-h-[156px] place-items-center rounded-md border border-dashed border-[rgba(42,30,20,0.14)] bg-cream-50 px-6 py-8 text-center">
      <div>
        <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-cream-100 text-ink-400">
          <CircleOff aria-hidden="true" size={18} strokeWidth={1.8} />
        </div>
        <h3 className="mt-3 font-serif text-base font-semibold text-ink-900">{title}</h3>
        {description ? <p className="mt-1 max-w-sm text-sm text-ink-500">{description}</p> : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
