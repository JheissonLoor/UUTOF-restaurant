export function MenuSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="h-9 w-52 rounded-xl bg-muted animate-pulse mb-6" />
      <div className="h-12 w-full rounded-2xl bg-muted animate-pulse mb-6" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-3xl border overflow-hidden">
            <div className="aspect-[4/3] bg-muted animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-4 w-full rounded bg-muted animate-pulse" />
              <div className="h-8 w-1/2 rounded-xl bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
