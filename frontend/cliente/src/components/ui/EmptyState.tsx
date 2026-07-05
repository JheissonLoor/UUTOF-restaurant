import { MenuIcon } from '@/components/icons';

export function EmptyState({ title, body, action }: { title: string; body: string; action?: JSX.Element }): JSX.Element {
  return (
    <div className="rounded-xl border border-[rgba(31,26,20,0.08)] bg-cream-surface px-5 py-8 text-center shadow-soft">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-coral-50 text-coral-600">
        <MenuIcon size={22} />
      </div>
      <h3 className="mt-4 font-serif text-xl font-semibold text-ink-900">{title}</h3>
      <p className="mx-auto mt-2 max-w-[260px] text-sm text-ink-500">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
