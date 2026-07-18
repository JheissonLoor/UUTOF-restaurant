import { EmptyIcon } from '@/components/icons';

interface EmptyStateProps {
  label?: string;
}

export function EmptyState({ label = 'Sin pedidos' }: EmptyStateProps): JSX.Element {
  return (
    <div className="grid flex-1 place-items-center px-4 py-10 text-center text-[13px] text-ink-400">
      <div>
        <div className="mb-2 flex justify-center opacity-50">
          <EmptyIcon size={26} />
        </div>
        {label}
      </div>
    </div>
  );
}
