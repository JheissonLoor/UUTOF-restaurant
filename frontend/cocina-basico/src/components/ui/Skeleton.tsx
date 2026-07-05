import { columns } from '@/data/mockOrders';

export function BoardSkeleton(): JSX.Element {
  return (
    <section className="grid flex-1 items-start gap-4 overflow-hidden pb-3" style={{ gridTemplateColumns: 'repeat(5, minmax(260px, 1fr))' }} aria-label="Cargando pedidos">
      {columns.map((column) => (
        <div key={column.id} className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-[rgba(31,26,20,0.08)] bg-cream-bg2">
          <header className="flex items-center gap-2 border-b border-[rgba(31,26,20,0.08)] bg-cream-surface px-4 py-3.5">
            <span className="h-[9px] w-[9px] rounded-full bg-ink-400/30" />
            <span className="h-4 w-28 animate-pulse rounded-sm bg-ink-400/15" />
            <span className="ml-auto h-6 w-8 animate-pulse rounded-full bg-ink-400/15" />
          </header>
          <div className="flex flex-col gap-3 p-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="rounded-md border border-[rgba(31,26,20,0.08)] bg-cream-surface p-3.5 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <span className="h-6 w-16 animate-pulse rounded-sm bg-ink-400/15" />
                  <span className="h-5 w-20 animate-pulse rounded-full bg-ink-400/15" />
                </div>
                <div className="space-y-2">
                  <span className="block h-3 w-32 animate-pulse rounded-sm bg-ink-400/15" />
                  <span className="block h-3 w-24 animate-pulse rounded-sm bg-ink-400/15" />
                  <span className="block h-3 w-40 animate-pulse rounded-sm bg-ink-400/15" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
