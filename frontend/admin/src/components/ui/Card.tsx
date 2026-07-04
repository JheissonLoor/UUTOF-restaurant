import clsx from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  meta?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function Card({ title, meta, action, children, className, bodyClassName }: CardProps): JSX.Element {
  return (
    <section
      className={clsx(
        'rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-6 shadow-sm-soft transition duration-200 hover:shadow-md-soft',
        className,
      )}
    >
      {title || meta || action ? (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            {title ? <h2 className="font-serif text-h2 text-ink-900">{title}</h2> : null}
            {meta ? <div className="mt-1 text-[12.5px] text-ink-500">{meta}</div> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
