import { Outlet } from 'react-router-dom';

import { TabNav } from '@/components/TabNav';
import { Topbar } from '@/components/Topbar';

export function AppShell(): JSX.Element {
  return (
    <div className="min-h-screen bg-cream-50 text-ink-900">
      <Topbar />
      <TabNav />
      <main id="main-content" className="mx-auto w-full max-w-[1440px] px-7 py-7 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
