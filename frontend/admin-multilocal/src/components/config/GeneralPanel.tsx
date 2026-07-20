import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, LoaderCircle } from 'lucide-react';
import { getGeneralConfig, updateGeneralConfig } from '../../api/empresa';
import { getApiErrorMessage } from '../../api/errors';
import type { GeneralConfig } from '../../types/multilocal';

export function GeneralPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ['general-config'], queryFn: getGeneralConfig });
  const [draft, setDraft] = useState<GeneralConfig | null>(null);
  useEffect(() => { if (query.data) setDraft(query.data); }, [query.data]);
  const mutation = useMutation({
    mutationFn: updateGeneralConfig,
    onSuccess: (data) => { setDraft(data); void queryClient.invalidateQueries({ queryKey: ['general-config'] }); },
  });
  if (query.isError) return <p role="alert" className="rounded-card bg-danger/10 px-4 py-3 text-sm text-danger">{getApiErrorMessage(query.error)}</p>;
  if (!draft) return <div className="h-96 animate-pulse rounded-card bg-bg2" />;
  function submit(event: FormEvent) { event.preventDefault(); if (draft) mutation.mutate(draft); }
  return (
    <form onSubmit={submit} className="rounded-card border border-[#E7DED3] bg-surface p-6 shadow-card">
      <h2 className="font-display text-xl font-semibold text-ink">Datos del negocio</h2><p className="mt-1 text-xs text-ink4">Configuración general de la red UTTOF.</p>
      {mutation.isError ? <p role="alert" className="mt-4 rounded-card bg-danger/10 px-3 py-2 text-xs text-danger">{getApiErrorMessage(mutation.error)}</p> : null}
      {mutation.isSuccess ? <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-mint-dark"><Check size={14} /> Cambios guardados</p> : null}
      <div className="mt-5 grid grid-cols-2 gap-4 max-[760px]:grid-cols-1">
        <label className="text-xs font-semibold text-ink2">Nombre comercial<input required minLength={2} value={draft.nombre_comercial} onChange={(e) => setDraft({ ...draft, nombre_comercial: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-ink2">RUC<input required pattern="\d{11}" value={draft.ruc} onChange={(e) => setDraft({ ...draft, ruc: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 font-mono text-sm" /></label>
        <label className="text-xs font-semibold text-ink2">Correo<input required type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-ink2">Teléfono<input required value={draft.telefono} onChange={(e) => setDraft({ ...draft, telefono: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
        <label className="col-span-2 text-xs font-semibold text-ink2 max-[760px]:col-span-1">Dirección principal<input required value={draft.direccion} onChange={(e) => setDraft({ ...draft, direccion: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-ink2">Apertura<input required type="time" value={draft.horario_apertura} onChange={(e) => setDraft({ ...draft, horario_apertura: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-ink2">Cierre<input required type="time" value={draft.horario_cierre} onChange={(e) => setDraft({ ...draft, horario_cierre: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
        <label className="text-xs font-semibold text-ink2">Zona horaria<input readOnly value="America/Lima" className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] bg-bg px-3 text-sm text-ink3" /></label>
      </div>
      <div className="mt-6 flex justify-end"><button type="submit" disabled={mutation.isPending} className="flex h-10 items-center gap-2 rounded-card bg-ink px-5 text-xs font-semibold text-white disabled:opacity-50">{mutation.isPending ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />} Guardar cambios</button></div>
    </form>
  );
}
