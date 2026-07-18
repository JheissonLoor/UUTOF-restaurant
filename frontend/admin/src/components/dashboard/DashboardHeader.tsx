export function DashboardHeader(): JSX.Element {
  return (
    <div className="mb-6">
      <div>
        <h1 className="font-serif text-[36px] font-semibold leading-tight text-ink-900">Panel de Administración</h1>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-ink-500">
          Gestiona tu restaurante desde un solo lugar
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-2.5 py-1 text-xs font-medium text-sage-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sage-500" />
            En vivo
          </span>
        </div>
      </div>
    </div>
  );
}
