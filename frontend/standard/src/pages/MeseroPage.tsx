import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Banknote, CheckCircle2, Clock3, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';

import { getPagosPendientes, verificarPago } from '@/api/verificador';
import { ErrorState } from '@/components/ErrorState';
import { formatCurrency } from '@/lib/format';
import type { PagoPendiente } from '@/types';

interface PagoVerificado {
  idTransaccion: number;
  mesa: number;
  cliente: string;
  total: number;
  recibido: number;
  cambio: number;
}

function PagoSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[0, 1, 2, 3].map((item) => (
        <div key={item} className="h-40 animate-pulse rounded-2xl border bg-muted" />
      ))}
    </div>
  );
}

export default function MeseroPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PagoPendiente | null>(null);
  const [recibido, setRecibido] = useState('');
  const [lastVerified, setLastVerified] = useState<PagoVerificado | null>(null);

  const pagosQuery = useQuery({
    queryKey: ['pagos-pendientes'],
    queryFn: getPagosPendientes,
    refetchInterval: 20000,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pagosQuery.data ?? [];
    return (pagosQuery.data ?? []).filter(
      (pago) => pago.numero_mesa.toString() === term || pago.cliente.toLowerCase().includes(term),
    );
  }, [pagosQuery.data, search]);

  const verifyMutation = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error('Selecciona un pago');
      const amount = Number(recibido);
      if (!Number.isFinite(amount) || amount < selected.total) {
        throw new Error(`El monto recibido debe ser al menos ${formatCurrency(selected.total)}`);
      }
      const response = await verificarPago(selected.id_transaccion, amount);
      return { response, pago: selected, amount };
    },
    onSuccess: ({ response, pago, amount }) => {
      const cambio = Number(response.cambio ?? amount - pago.total);
      setLastVerified({
        idTransaccion: pago.id_transaccion,
        mesa: pago.numero_mesa,
        cliente: pago.cliente,
        total: pago.total,
        recibido: amount,
        cambio,
      });
      setSelected(null);
      setRecibido('');
      toast.success(`Pago de la mesa ${pago.numero_mesa} verificado`);
      void queryClient.invalidateQueries({ queryKey: ['pagos-pendientes'] });
    },
    onError: (error: Error) => toast.error(error.message || 'No se pudo verificar el pago'),
  });

  const openPayment = (pago: PagoPendiente) => {
    setSelected(pago);
    setRecibido(pago.total.toFixed(2));
    setLastVerified(null);
  };

  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
              <Banknote className="h-5 w-5 text-primary" />
            </span>
            <h1 className="font-heading text-3xl font-bold">Verificador de efectivo</h1>
          </div>
          <p className="text-sm text-muted-foreground">Confirma los cobros en efectivo antes de liberar la mesa.</p>
        </div>
        <button
          type="button"
          onClick={() => void pagosQuery.refetch()}
          disabled={pagosQuery.isFetching}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium transition hover:bg-muted disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${pagosQuery.isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="min-h-12 w-full rounded-2xl border bg-card pl-11 pr-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Buscar por mesa o cliente"
        />
      </div>

      {lastVerified && (
        <section className="mb-6 rounded-2xl border border-status-paid/40 bg-status-paid/5 p-5" aria-live="polite">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-status-paid" />
            <div>
              <h2 className="font-heading text-xl font-semibold text-status-paid">Pago verificado</h2>
              <p className="mt-1 text-sm">{lastVerified.cliente} · Mesa {lastVerified.mesa}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Total {formatCurrency(lastVerified.total)} · Recibido {formatCurrency(lastVerified.recibido)} · Cambio{' '}
                <strong className="text-foreground">{formatCurrency(lastVerified.cambio)}</strong>
              </p>
            </div>
          </div>
        </section>
      )}

      {pagosQuery.isLoading && <PagoSkeleton />}
      {pagosQuery.isError && (
        <ErrorState message="No se pudieron cargar los pagos pendientes." onRetry={() => pagosQuery.refetch()} />
      )}
      {!pagosQuery.isLoading && !pagosQuery.isError && filtered.length === 0 && (
        <div className="rounded-2xl border bg-card px-6 py-16 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-status-paid" />
          <h2 className="font-heading text-xl font-semibold">No hay cobros pendientes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {search ? 'No hay coincidencias para esta búsqueda.' : 'Los nuevos pagos en efectivo aparecerán aquí.'}
          </p>
        </div>
      )}
      {!pagosQuery.isLoading && !pagosQuery.isError && filtered.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((pago) => (
            <article key={pago.id_transaccion} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-primary">Mesa {pago.numero_mesa}</p>
                  <h2 className="mt-1 font-heading text-xl font-semibold">{pago.cliente}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">Pedido #{pago.id_pedido}</p>
                </div>
                <span className="rounded-full bg-status-waiting/15 px-3 py-1 text-xs font-semibold text-foreground">Pendiente</span>
              </div>
              <div className="my-4 flex items-end justify-between border-y py-3">
                <span className="text-sm text-muted-foreground">Total a cobrar</span>
                <strong className="text-xl">{formatCurrency(pago.total)}</strong>
              </div>
              <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock3 className="h-3.5 w-3.5" />
                {new Date(pago.fecha).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
              </div>
              <button
                type="button"
                onClick={() => openPayment(pago)}
                className="min-h-11 w-full rounded-xl bg-primary px-4 font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Confirmar cobro
              </button>
            </article>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
          <section className="w-full max-w-md rounded-t-3xl border bg-card p-6 shadow-xl sm:rounded-3xl">
            <p className="text-xs font-semibold uppercase text-primary">Mesa {selected.numero_mesa}</p>
            <h2 className="mt-1 font-heading text-2xl font-bold">Confirmar efectivo</h2>
            <p className="mt-1 text-sm text-muted-foreground">{selected.cliente} · Total {formatCurrency(selected.total)}</p>

            <label className="mt-5 block text-sm font-medium" htmlFor="monto-recibido">Monto recibido</label>
            <div className="relative mt-2">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground">S/</span>
              <input
                id="monto-recibido"
                type="number"
                min={selected.total}
                step="0.10"
                value={recibido}
                onChange={(event) => setRecibido(event.target.value)}
                className="min-h-12 w-full rounded-xl border bg-background pl-12 pr-4 text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            </div>
            {Number(recibido) >= selected.total && (
              <p className="mt-2 text-sm text-muted-foreground">Cambio: {formatCurrency(Number(recibido) - selected.total)}</p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="min-h-11 rounded-xl border font-semibold transition hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => verifyMutation.mutate()}
                disabled={verifyMutation.isPending || Number(recibido) < selected.total}
                className="min-h-11 rounded-xl bg-primary font-semibold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
              >
                {verifyMutation.isPending ? 'Verificando...' : 'Verificar pago'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
