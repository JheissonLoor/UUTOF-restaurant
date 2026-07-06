import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
  strokeWidth?: number
}

function Icon({ size = 16, strokeWidth = 1.8, children, ...props }: IconProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function FlameIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M12 22c4 0 7-3 7-7 0-4-4-6-4-10 0 0-3 1-5 5-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7Z" /></Icon>
}

export function ClockIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Icon>
}

export function CheckIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="m4 12 5 5L20 6" /></Icon>
}

export function BellIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M6 16v-5a6 6 0 1 1 12 0v5l1.5 2.5h-15L6 16Z" /><path d="M10 20a2 2 0 0 0 4 0" /></Icon>
}

export function AlertIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M12 2 2 21h20L12 2Z" /><path d="M12 9v5M12 18v.01" /></Icon>
}

export function PlateIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></Icon>
}

export function ZapIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" /></Icon>
}

export function MaximizeIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" /></Icon>
}

export function LogOutIcon(props: IconProps): JSX.Element {
  return <Icon {...props}><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-5" /></Icon>
}
