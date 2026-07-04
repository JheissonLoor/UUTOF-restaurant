import clsx from 'clsx';
import { AlertTriangle, Check, Info, X } from 'lucide-react';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type ToastVariant = 'success' | 'warning' | 'error' | 'info';

interface ToastMessage {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextValue {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
}

interface ToastProviderProps {
  children: ReactNode;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toneClasses: Record<ToastVariant, string> = {
  success: 'bg-sage-100 text-sage-500',
  warning: 'bg-saffron-100 text-saffron-500',
  error: 'bg-wine-100 text-wine-500',
  info: 'bg-sky-100 text-sky-500',
};

const icons = {
  success: Check,
  warning: AlertTriangle,
  error: X,
  info: Info,
};

export function ToastProvider({ children }: ToastProviderProps): JSX.Element {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: Omit<ToastMessage, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { ...message, id }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex w-[320px] max-w-[calc(100vw-40px)] flex-col gap-3">
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <div
              key={toast.id}
              className="flex items-start gap-3 rounded-lg border border-[rgba(42,30,20,0.08)] bg-white p-4 text-ink-900 shadow-lg-soft animate-[count-in_220ms_ease-out]"
              role="status"
            >
              <div className={clsx('grid h-8 w-8 shrink-0 place-items-center rounded-md', toneClasses[toast.variant])}>
                <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold">{toast.title}</div>
                {toast.description ? <div className="mt-0.5 text-xs text-ink-500">{toast.description}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }

  return context;
}
