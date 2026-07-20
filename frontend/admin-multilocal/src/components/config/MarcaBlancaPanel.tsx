import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, LoaderCircle, Upload } from 'lucide-react';
import { getMarcaConfig, updateMarcaConfig } from '../../api/empresa';
import { getApiErrorMessage } from '../../api/errors';
import type { MarcaConfig } from '../../types/multilocal';

const swatches = ['#E94B33', '#3A8A72', '#4A6F88', '#6E4F84', '#B07E1E', '#1F1A14'];

export function MarcaBlancaPanel() {
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const query = useQuery({ queryKey: ['marca-config'], queryFn: getMarcaConfig });
  const [draft, setDraft] = useState<MarcaConfig | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  useEffect(() => { if (query.data) setDraft(query.data); }, [query.data]);
  const mutation = useMutation({
    mutationFn: updateMarcaConfig,
    onSuccess: (data) => {
      setDraft(data);
      void queryClient.invalidateQueries({ queryKey: ['marca-config'] });
    },
  });

  if (query.isError) return <p role="alert" className="rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{getApiErrorMessage(query.error)}</p>;
  if (query.isPending || !draft) return <div className="h-[520px] animate-pulse rounded-card bg-bg2" />;
  const error = mutation.isError ? mutation.error : null;

  function readLogo(file?: File) {
    setFileError(null);
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setFileError('Usa una imagen PNG, JPG o WebP.');
      return;
    }
    if (file.size > 1_000_000) {
      setFileError('El logo no puede superar 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDraft((current) => current ? { ...current, logo_url: String(reader.result) } : current);
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_360px] gap-6 max-[980px]:grid-cols-1">
      <section className="rounded-card border border-[#E7DED3] bg-surface p-6 shadow-card">
        <h2 className="font-display text-xl font-semibold text-ink">Identidad de la marca</h2>
        <p className="mt-1 text-xs text-ink4">Se aplica a las experiencias de cliente y mesero.</p>
        {error ? <p role="alert" className="mt-4 rounded-card bg-danger/10 px-3 py-2 text-xs text-danger">{getApiErrorMessage(error)}</p> : null}
        <div className="mt-5 space-y-5">
          <div><label className="text-xs font-semibold text-ink2">Logo</label><div className="mt-2 flex items-center gap-3 rounded-card border border-dashed border-[#CFC3B7] bg-bg p-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-card font-display text-lg font-bold text-white" style={{ backgroundColor: draft.color_primario }}>{draft.logo_url ? <img src={draft.logo_url} alt="Logo actual" className="h-full w-full object-contain" /> : draft.nombre_marca.slice(0, 2).toUpperCase()}</span><div className="min-w-0 flex-1"><strong className="block text-xs text-ink">PNG, JPG o WebP</strong><span className="text-[10px] text-ink4">Máximo 1 MB.</span></div><input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => readLogo(e.target.files?.[0])} className="hidden" /><button type="button" onClick={() => fileInput.current?.click()} className="flex h-10 items-center gap-2 rounded-card border border-[#DED4C8] bg-white px-3 text-xs font-semibold text-ink2"><Upload size={15} /> Subir</button></div>{fileError ? <p className="mt-1 text-xs text-danger">{fileError}</p> : null}</div>
          <label className="block text-xs font-semibold text-ink2">Nombre visible<input value={draft.nombre_marca} minLength={2} onChange={(e) => setDraft({ ...draft, nombre_marca: e.target.value })} className="mt-2 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
          <div><span className="text-xs font-semibold text-ink2">Color primario</span><div className="mt-2 flex flex-wrap gap-2">{swatches.map((color) => <button key={color} type="button" title={color} aria-label={`Usar color ${color}`} aria-pressed={draft.color_primario === color} onClick={() => setDraft({ ...draft, color_primario: color })} className={`flex h-11 w-11 items-center justify-center rounded-card border-2 ${draft.color_primario === color ? 'border-ink' : 'border-transparent'}`} style={{ backgroundColor: color }}>{draft.color_primario === color ? <Check size={18} className="text-white" /> : null}</button>)}</div></div>
          <label className="block text-xs font-semibold text-ink2">Subdominio<div className="mt-2 flex overflow-hidden rounded-card border border-[#DED4C8] bg-white"><input value={draft.subdominio} pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?" onChange={(e) => setDraft({ ...draft, subdominio: e.target.value.toLowerCase() })} className="h-11 min-w-0 flex-1 border-0 px-3 text-sm outline-none" /><span className="flex items-center bg-bg2 px-3 font-mono text-[11px] text-ink4">.uttof.pe</span></div></label>
        </div>
        <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => query.data && setDraft(query.data)} className="h-10 rounded-card px-4 text-xs font-semibold text-ink3 hover:bg-bg">Descartar</button><button type="button" disabled={mutation.isPending || !draft.nombre_marca || !draft.subdominio} onClick={() => mutation.mutate(draft)} className="flex h-10 items-center gap-2 rounded-card bg-ink px-5 text-xs font-semibold text-white disabled:opacity-50">{mutation.isPending ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />} Guardar y aplicar</button></div>
      </section>

      <aside className="self-start" aria-label="Vista previa de la app cliente">
        <p className="mb-3 text-center font-mono text-[9px] font-semibold uppercase text-ink4">Vista previa · App cliente</p>
        <div className="mx-auto h-[520px] w-[270px] rounded-[36px] bg-[#0A0805] p-2 shadow-lift"><div className="flex h-full flex-col overflow-hidden rounded-[29px] bg-bg"><header className="px-5 pb-5 pt-9 text-white" style={{ backgroundColor: draft.color_primario }}><div className="flex items-center gap-2">{draft.logo_url ? <img src={draft.logo_url} alt="" className="h-8 w-8 rounded-card bg-white object-contain" /> : <span className="flex h-8 w-8 items-center justify-center rounded-card bg-white/15 font-display text-xs font-bold">{draft.nombre_marca.slice(0, 2).toUpperCase()}</span>}<strong className="font-display text-lg">{draft.nombre_marca}</strong></div><p className="mt-3 text-[10px] text-white/75">Bienvenido. ¿Qué te provoca hoy?</p></header><main className="flex-1 p-4"><div className="h-28 rounded-card bg-bg2" /><h3 className="mt-4 font-display text-lg font-semibold text-ink">Nuestra carta</h3><div className="mt-3 space-y-2">{[1, 2, 3].map((row) => <div key={row} className="flex items-center gap-2 rounded-card bg-white p-2"><span className="h-9 w-9 rounded-card bg-bg2" /><span className="h-2 flex-1 rounded bg-bg2" /><span className="h-6 w-6 rounded-full text-white" style={{ backgroundColor: draft.color_primario }} /></div>)}</div></main><button type="button" className="m-4 h-11 rounded-card text-xs font-semibold text-white" style={{ backgroundColor: draft.color_primario }}>Ver mi pedido</button></div></div>
      </aside>
    </div>
  );
}
