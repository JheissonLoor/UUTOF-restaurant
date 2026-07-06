export function TicketSkeletonGrid(): JSX.Element {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-3.5">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="min-h-[260px] animate-pulse rounded-[16px] border border-white/[0.08] bg-surface">
          <div className="h-1.5 rounded-t-[16px] bg-white/[0.08]" />
          <div className="space-y-4 p-4">
            <div className="h-7 w-24 rounded-sm bg-white/[0.08]" />
            <div className="h-4 w-full rounded-sm bg-white/[0.08]" />
            <div className="h-4 w-2/3 rounded-sm bg-white/[0.08]" />
            <div className="h-20 rounded-sm bg-white/[0.08]" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function BoardMessage({ tone, title, detail }: { tone: 'empty' | 'error'; title: string; detail: string }): JSX.Element {
  return (
    <div className={`grid min-h-full place-items-center rounded-lg border ${tone === 'error' ? 'border-danger/40 bg-danger/10 text-danger' : 'border-white/[0.08] bg-surface text-ink'}`}>
      <div className="text-center">
        <div className="font-serif text-[30px] font-semibold">{title}</div>
        <p className="mt-2 text-sm text-ink-3">{detail}</p>
      </div>
    </div>
  )
}
