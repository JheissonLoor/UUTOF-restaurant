import { CheckIcon } from '@/components/icons';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps): JSX.Element {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-[13.5px] font-semibold text-cream-bg shadow-toast">
      <CheckIcon size={15} />
      {message}
    </div>
  );
}
