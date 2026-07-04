import clsx from 'clsx';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps): JSX.Element {
  return (
    <div
      className={clsx(
        'animate-shimmer rounded-md bg-[linear-gradient(90deg,#F4ECE0_0%,#FAF6F0_48%,#F4ECE0_100%)] bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

export function DashboardSkeleton(): JSX.Element {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-[152px] rounded-lg" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <Skeleton className="h-[360px] rounded-lg" />
        <Skeleton className="h-[360px] rounded-lg" />
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    </div>
  );
}
