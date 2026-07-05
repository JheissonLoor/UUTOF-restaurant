import type { ReactNode } from 'react';

interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function IconShell({ size = 16, strokeWidth = 1.8, className, children }: IconProps & { children: ReactNode }): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function CheckIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props} strokeWidth={props.strokeWidth ?? 2.4}>
      <path d="m4 12 5 5L20 6" />
    </IconShell>
  );
}

export function ChefIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <path d="M8 3a4 4 0 0 0-4 4c0 1.5.8 2.8 2 3.4V17h12v-6.6c1.2-.6 2-1.9 2-3.4a4 4 0 0 0-6.5-3.1A4 4 0 0 0 8 3z" />
      <path d="M6 21h12" />
    </IconShell>
  );
}

export function ClockIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconShell>
  );
}

export function EmptyIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14c1 1.2 2.4 2 4 2s3-.8 4-2" />
      <path d="M9 9.5h.01M15 9.5h.01" />
    </IconShell>
  );
}

export function HashIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <path d="M9 3 7 21M17 3l-2 18M4 8h17M3 16h17" />
    </IconShell>
  );
}

export function LockIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </IconShell>
  );
}

export function MailIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </IconShell>
  );
}

export function MoveIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </IconShell>
  );
}

export function TableIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <path d="M3 10h18M5 10v10M19 10v10M7 10V6h10v4" />
    </IconShell>
  );
}

export function UserIcon(props: IconProps): JSX.Element {
  return (
    <IconShell {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </IconShell>
  );
}

export function UtensilsMark(): JSX.Element {
  return (
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round">
      <path d="M7 3v7c0 1.1.9 2 2 2s2-.9 2-2V3M9 3v18M16 3c-1.5 1.5-2 4-2 6 0 1.7 1 3 2 3v9M16 3v9" />
    </svg>
  );
}
