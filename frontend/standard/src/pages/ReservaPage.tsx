import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, Users, MapPin, StickyNote, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { getMesas } from '@/api/pedidos';
import { crearReserva, getReservas } from '@/api/reservas';
import { formatLimaDateTime } from '@/lib/format';

function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date());
}

export default function ReservaPage() {
  const queryClient = useQueryClient();
  const [fecha, setFecha] = useState(todayISO());
  const [hora, setHora] = useState('20:00');
  const [idMesa, setIdMesa] = useState<number | ''>('');
  const [personas, setPersonas] = useState(2);
  const [notas, setNotas] = useState('');

  const { data: mesas } = useQuery({ queryKey: ['mesas'], queryFn: getMesas });
  const { data: reservas } = useQuery({ queryKey: ['reservas', fecha], queryFn: () => getReservas(fecha) });

  const mesasDisponibles = useMemo(() => (mesas ?? []).filter((m) => m.estado === 'libre' || m.estado === 'reservada'), [mesas]);

  const reservaMutation = useMutation({
    mutationFn: () =>
      crearReserva({
        id_mesa: Number(idMesa),
        hora_reserva: new Date(`${fecha}T${hora}:00`).toISOString(),
        num_personas: personas,
        notas: notas || undefined,
      }),
    onSuccess: () => {
      toast.success('¡Reserva confirmada!');
      setNotas('');
      void queryClient.invalidateQueries({ queryKey: ['reservas', fecha] });
    },
    onError: () => toast.error('No se pudo crear la reserva. Revisa la mesa y el horario.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idMesa) {
      toast.error('Elige una mesa');
      return;
    }
    reservaMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold mb-1">Reservar Mesa</h1>
        <p className="text-muted-foreground text-sm">Aparta tu mesa con anticipación y evita esperas.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="bg-card rounded-3xl border p-6 space-y-5 h-fit"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-muted-foreground" /> Fecha
              </label>
              <input
                type="date"
                value={fecha}
                min={todayISO()}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" /> Hora
              </label>
              <input
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-muted-foreground" /> Mesa
            </label>
            <select
              value={idMesa}
              onChange={(e) => setIdMesa(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-3 rounded-2xl border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            >
              <option value="">Selecciona una mesa…</option>
              {mesasDisponibles.map((m) => (
                <option key={m.id_mesa} value={m.id_mesa}>
                  Mesa #{m.numero} · {m.zona} · {m.capacidad} personas
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-muted-foreground" /> Personas
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPersonas((p) => Math.max(1, p - 1))}
                className="w-11 h-11 rounded-2xl border flex items-center justify-center hover:bg-muted transition text-lg font-bold"
              >
                −
              </button>
              <span className="text-lg font-bold w-8 text-center">{personas}</span>
              <button
                type="button"
                onClick={() => setPersonas((p) => Math.min(50, p + 1))}
                className="w-11 h-11 rounded-2xl border flex items-center justify-center hover:bg-muted transition text-lg font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
              <StickyNote className="h-4 w-4 text-muted-foreground" /> Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 rounded-2xl border bg-background text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition resize-none"
              placeholder="Cumpleaños, silla para bebé, alergias…"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={reservaMutation.isPending}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-md shadow-primary/20 disabled:opacity-70"
          >
            {reservaMutation.isPending ? 'Reservando…' : 'Confirmar reserva'}
          </motion.button>
        </motion.form>

        {/* Reservas del día */}
        <div>
          <h2 className="font-heading text-lg font-semibold mb-3">Reservas del {fecha}</h2>
          {reservas && reservas.length > 0 ? (
            <div className="space-y-3">
              {reservas.map((r) => (
                <motion.div
                  key={r.id_reserva}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-card rounded-2xl border p-4 flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{r.nombre_cliente}</p>
                    <p className="text-xs text-muted-foreground">
                      Mesa #{r.id_mesa} · {r.num_personas} pers. · {formatLimaDateTime(r.hora_reserva)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-dashed p-8 text-center">
              <CalendarDays className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No hay reservas para esta fecha.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
