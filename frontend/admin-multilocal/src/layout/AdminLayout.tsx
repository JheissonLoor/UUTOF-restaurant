import type { ReactNode } from 'react';

interface AdminLayoutProps {
  sidebar?: ReactNode;
  children: ReactNode;
}

export function AdminLayout({ sidebar, children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen min-w-[1180px] bg-bg text-ink">
      <aside className="sticky top-0 h-screen w-[248px] shrink-0 overflow-y-auto bg-gradient-to-b from-sidebar to-sidebar-soft">
        {sidebar}
      </aside>
      <main id="contenido-principal" className="min-w-0 flex-1 px-9 py-8">
        {children}
      </main>
    </div>
  );
}
