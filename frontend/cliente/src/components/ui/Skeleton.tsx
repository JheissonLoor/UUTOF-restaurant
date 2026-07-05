export function CardSkeleton(): JSX.Element {
  return (
    <div className="rounded-xl border border-[rgba(31,26,20,0.08)] bg-cream-surface p-3 shadow-soft">
      <div className="h-32 animate-pulse rounded-lg bg-ink-400/15" />
      <div className="mt-3 h-4 w-2/3 animate-pulse rounded-sm bg-ink-400/15" />
      <div className="mt-2 h-3 w-full animate-pulse rounded-sm bg-ink-400/15" />
      <div className="mt-4 h-10 animate-pulse rounded-sm bg-ink-400/15" />
    </div>
  );
}
