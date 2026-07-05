import { useEffect } from 'react';

import { CheckIcon } from '@/components/icons';

export function Toast({ message, onDone }: { message: string; onDone: () => void }): JSX.Element {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 2300);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 z-[80] flex min-h-11 -translate-x-1/2 items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-[13px] font-semibold text-cream-bg shadow-toast">
      <CheckIcon size={14} />
      {message}
    </div>
  );
}
