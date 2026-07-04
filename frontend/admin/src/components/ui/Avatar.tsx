import clsx from 'clsx';

interface AvatarProps {
  label: string;
  tone?: 'order' | 'pay' | 'ready' | 'reserve' | 'review';
  size?: 'sm' | 'md' | 'lg';
}

const toneClasses: Record<NonNullable<AvatarProps['tone']>, string> = {
  order: 'bg-terracotta-50 text-terracotta-500',
  pay: 'bg-sage-100 text-sage-500',
  ready: 'bg-sky-100 text-sky-500',
  reserve: 'bg-saffron-100 text-saffron-500',
  review: 'bg-wine-100 text-wine-500',
};

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export function Avatar({ label, tone = 'order', size = 'md' }: AvatarProps): JSX.Element {
  const initials = label.trim().slice(0, 2).toUpperCase() || 'UT';

  return (
    <span className={clsx('grid shrink-0 place-items-center rounded-full font-semibold', toneClasses[tone], sizeClasses[size])}>
      {initials}
    </span>
  );
}
