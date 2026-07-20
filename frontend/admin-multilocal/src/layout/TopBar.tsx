import type { ReactNode } from 'react';

interface TopBarProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  titleId?: string;
}

export function TopBar({ title, subtitle, actions, titleId }: TopBarProps) {
  return (
    <header className="mb-[22px] flex min-h-[62px] items-start justify-between gap-5">
      <div className="min-w-0">
        <h1 id={titleId} className="font-display text-[32px] font-semibold leading-tight text-ink">
          {title}
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-ink3">{subtitle}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2.5">{actions}</div> : null}
    </header>
  );
}
