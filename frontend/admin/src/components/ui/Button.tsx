import clsx from 'clsx';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'border border-terracotta-500 bg-terracotta-500 text-white shadow-md-soft hover:-translate-y-px hover:bg-terracotta-600',
  ghost:
    'border border-[rgba(42,30,20,0.14)] bg-transparent text-ink-900 hover:-translate-y-px hover:bg-cream-100',
  icon: 'border border-transparent bg-transparent text-ink-500 hover:bg-cream-100 hover:text-ink-900',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 rounded-sm px-3 text-xs',
  md: 'h-10 rounded-md px-4 text-sm',
  lg: 'h-11 rounded-md px-5 text-sm',
};

export function Button({
  variant = 'ghost',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps): JSX.Element {
  const isIcon = variant === 'icon';

  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        variantClasses[variant],
        isIcon ? 'h-9 w-9 rounded-md p-0' : sizeClasses[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 aria-hidden="true" className="animate-spin" size={16} strokeWidth={1.8} /> : null}
      {children}
    </button>
  );
}
