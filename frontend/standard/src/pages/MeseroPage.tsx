import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, XCircle, Clock, ClipboardCheck, History } from 'lucide-react';

import { getKitchenOrders } from '@/api/cocina';
import { formatCurrency } from '@/lib/format';
import type { KitchenOrder } from '@/types';

interface VerificationLog {
  query: string;
  result: 'paid' | 'pending' | 'not_found';
  customer?: string;
  mesa?: number;
  time: string;
}

type SearchResult = KitchenOrder | 'not_found' | null;

export default function MeseroPage() {
  const { data: orders } = useQuery({ queryKey: ['cocina'], queryFn: getKitchenOrders, refetchInterval: 20000 });
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult>(null);
  const [history, setHistory] = useState<VerificationLog[]>([]);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    const found = (orders ?? []).find(
      (o) => o.mesa.toString() === q || o.cliente.toLowerCase().includes(q.toLowerCase()),
    );
    setResult(found ?? 'not_found');
    setHistory((prev) => [
      {
        query: q,
        time: new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima', hour: '2-digit', minute: '2-digit' }),
        result: !found ? 'not_found' : found.estado === 'pagado' ? 'paid' : 'pending',
        customer: found?.cliente,
        mesa: found?.mesa,
      },
      ...prev.slice(0, 9),
    ]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <ClipboardCheck className="h-5 w-5 text-primary" />
        </div>
        <h1 className="font-heading text-3xl font-bold">Verificación de Salida</h1>
      </div>
      <p className="text-muted-foreground mb-8 ml-[52px]">Busca por número de mesa o nombre del cliente</p>

      <div className="flex gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none transition"
            placeholder="Mesa # o nombre del cliente…"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSearch}
          className="px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20"
        >
          Buscar
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {result && result !== 'not_found' && (
          <motion.div
            key={`found-${result.id_pedido}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {result.estado === 'pagado' ? (
              <div className="text-center p-12 rounded-3xl border-2 border-status-paid bg-status-paid/5">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
                  <CheckCircle2 className="h-24 w-24 text-status-paid mx-auto mb-5" />
                </motion.div>
                <h2 className="font-heading text-4xl font-bold text-status-paid mb-3">PAGADO ✓</h2>
                <p className="text-xl font-semibold mb-1">Puede salir</p>
                <p className="text-muted-foreground">
                  {result.cliente} · Mesa #{result.mesa}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-status-paid/10 text-status-paid text-sm font-medium">
                  Total: {formatCurrency(result.total)}
                </div>
              </div>
            ) : (
              <div className="text-center p-12 rounded-3xl border-2 border-destructive bg-destructive/5">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring' }}>
                  <XCircle className="h-24 w-24 text-destructive mx-auto mb-5" />
                </motion.div>
                <h2 className="font-heading text-4xl font-bold text-destructive mb-3">PENDIENTE ✗</h2>
                <p className="text-xl font-semibold mb-1">No puede salir todavía</p>
                <p className="text-muted-foreground">
                  {result.cliente} · Mesa #{result.mesa}
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium capitalize">
                  Estado: {result.estado}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {result === 'not_found' && (
          <motion.div
            key="not-found"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 rounded-3xl border bg-card"
          >
            <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">No se encontró ningún pedido</p>
            <p className="text-sm text-muted-foreground mt-1">Intenta con otro número de mesa o nombre</p>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <History className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">Búsquedas recientes</h3>
          </div>
          <div className="space-y-2">
            {history.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-xl bg-card border text-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      log.result === 'paid'
                        ? 'bg-status-paid'
                        : log.result === 'pending'
                          ? 'bg-destructive'
                          : 'bg-muted-foreground'
                    }`}
                  />
                  <span>{log.customer ? `${log.customer} · Mesa #${log.mesa}` : `"${log.query}" — No encontrado`}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{log.time}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
