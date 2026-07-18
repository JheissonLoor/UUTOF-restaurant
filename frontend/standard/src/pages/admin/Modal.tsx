import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ title, onClose, children }: ModalProps) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] w-full max-w-md max-h-[90dvh] overflow-y-auto bg-card border rounded-3xl shadow-2xl"
      >
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-card">
          <h2 className="font-heading text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </motion.div>
    </>
  );
}

export const inputClass =
  'w-full px-4 py-2.5 rounded-2xl border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition';

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {children}
    </div>
  );
}
