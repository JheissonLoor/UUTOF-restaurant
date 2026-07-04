import { Topbar } from '@/components/Topbar';
import { CocinaBoard } from '@/pages/CocinaBoard';

export function App(): JSX.Element {
  return (
    <div className="h-[100dvh] overflow-hidden bg-cream-bg text-ink-900">
      <Topbar />
      <CocinaBoard />
    </div>
  );
}
