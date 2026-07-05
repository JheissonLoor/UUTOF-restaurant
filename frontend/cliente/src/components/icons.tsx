import type { ReactNode } from 'react';

export interface IconProps {
  size?: number;
  strokeWidth?: number;
  className?: string;
}

function Icon({ size = 18, strokeWidth = 1.8, className, children }: IconProps & { children: ReactNode }): JSX.Element {
  return (
    <svg aria-hidden="true" className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function ArrowIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Icon>;
}

export function BagIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M6 7h12l-1 13H7L6 7z" /><path d="M9 7a3 3 0 0 1 6 0" /></Icon>;
}

export function BellIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 16z" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>;
}

export function CalendarIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></Icon>;
}

export function CameraIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M5 7h2l1-2h8l1 2h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="3.2" /></Icon>;
}

export function CheckIcon(props: IconProps): JSX.Element {
  return <Icon {...props} strokeWidth={props.strokeWidth ?? 2.4}><path d="m4 12 5 5L20 6" /></Icon>;
}

export function ClockIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>;
}

export function CloseIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M6 6l12 12M18 6 6 18" /></Icon>;
}

export function FlameIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M12 22c4 0 7-3 7-7 0-4-4-6-4-10 0 0-3 1-5 5-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z" /></Icon>;
}

export function HeartIcon(props: IconProps & { filled?: boolean }): JSX.Element {
  return (
    <svg aria-hidden="true" className={props.className} width={props.size ?? 18} height={props.size ?? 18} viewBox="0 0 24 24" fill={props.filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={props.strokeWidth ?? 1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23 8.5 21.5 12c-2.5 4.5-9.5 9-9.5 9z" />
    </svg>
  );
}

export function HomeIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M3 12 12 3l9 9" /><path d="M5 10v10h14V10" /></Icon>;
}

export function MenuIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M6 3v18M6 8h4a3 3 0 0 0 0-6H6" /><path d="M18 3v18M18 3c-1.7 0-3 3-3 6s1.3 4 3 4" /></Icon>;
}

export function MinusIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M5 12h14" /></Icon>;
}

export function PlusIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M12 5v14M5 12h14" /></Icon>;
}

export function SearchIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>;
}

export function SparkIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" /></Icon>;
}

export function TableIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M3 10h18M5 10v10M19 10v10M7 10V6h10v4" /></Icon>;
}

export function UsersIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><circle cx="9" cy="8" r="3.5" /><path d="M2 20c1-4 5-5.5 7-5.5s6 1.5 7 5.5" /><circle cx="17" cy="9" r="2.5" /><path d="M22 18c-.5-2.5-2.5-3.5-4-3.5" /></Icon>;
}
