import { useEffect, useState, type FormEvent } from 'react';
import { Image, LoaderCircle, Plus, Trash2, X } from 'lucide-react';
import { fmtSoles } from '../../lib/format';
import type { SucursalActiva } from '../../context/SucursalContext';
import type {
  CategoriaMenu,
  MenuMultilocalItem,
  PlatilloMultilocalCreate,
  PlatilloMultilocalPatch,
  SucursalResumen,
} from '../../types/multilocal';

interface MenuManagerProps {
  items?: MenuMultilocalItem[];
  categories: CategoriaMenu[];
  branches: SucursalResumen[];
  activeBranch: SucursalActiva;
  loading?: boolean;
  saving?: boolean;
  onCreate: (payload: PlatilloMultilocalCreate) => Promise<void>;
  onUpdate: (item: MenuMultilocalItem, payload: PlatilloMultilocalPatch) => void;
  onDelete: (item: MenuMultilocalItem) => void;
}

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={checked ? 'Marcar como no disponible' : 'Marcar como disponible'}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-7 w-12 rounded-full transition-colors ${checked ? 'bg-mint-dark' : 'bg-[#CFC5BA]'} disabled:opacity-50`}
    >
      <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

function PriceCell({ item, disabled, onUpdate }: { item: MenuMultilocalItem; disabled?: boolean; onUpdate: (price: number) => void }) {
  const [value, setValue] = useState(item.precio.toFixed(2));
  useEffect(() => setValue(item.precio.toFixed(2)), [item.precio]);
  return (
    <label className="inline-flex items-center rounded-card border border-transparent px-2 focus-within:border-[#DED4C8] focus-within:bg-white">
      <span className="text-xs text-ink4">S/</span>
      <input
        type="number"
        min="0.1"
        step="0.1"
        value={value}
        disabled={disabled}
        aria-label={`Precio de ${item.nombre}`}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          const price = Number(value);
          if (price > 0 && price !== item.precio) onUpdate(price);
          else setValue(item.precio.toFixed(2));
        }}
        className="h-9 w-16 border-0 bg-transparent text-right font-mono text-xs font-semibold tabular-nums text-ink outline-none"
      />
    </label>
  );
}

export function MenuManager({
  items = [], categories, branches, activeBranch, loading = false, saving = false, onCreate, onUpdate, onDelete,
}: MenuManagerProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const initialBranch = activeBranch === 'red' ? branches[0]?.id_sucursal ?? 0 : activeBranch;
  const [form, setForm] = useState({ id_sucursal: initialBranch, id_categoria: categories[0]?.id_categoria ?? 0, nombre: '', precio: '', imagen_url: '' });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      id_sucursal: activeBranch === 'red' ? current.id_sucursal || branches[0]?.id_sucursal || 0 : activeBranch,
      id_categoria: current.id_categoria || categories[0]?.id_categoria || 0,
    }));
  }, [activeBranch, branches, categories]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onCreate({
      id_sucursal: form.id_sucursal,
      id_categoria: form.id_categoria,
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      disponible: true,
      imagen_url: form.imagen_url.trim() || null,
    });
    setModalOpen(false);
    setForm((current) => ({ ...current, nombre: '', precio: '', imagen_url: '' }));
  }

  return (
    <>
      <section className="overflow-hidden rounded-card border border-[#E7DED3] bg-surface shadow-card">
        <header className="flex items-center justify-between gap-4 border-b border-[#EEE6DC] px-5 py-4">
          <div><h2 className="font-display text-lg font-semibold text-ink">Carta por sucursal</h2><p className="mt-0.5 text-xs text-ink4">{items.length} configuraciones visibles</p></div>
          <button type="button" onClick={() => setModalOpen(true)} className="flex h-10 items-center gap-2 rounded-card bg-ink px-4 text-xs font-semibold text-white hover:bg-ink2">
            <Plus size={16} /> Platillo
          </button>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead><tr className="bg-[#FCF9F5] text-left font-mono text-[9px] font-semibold uppercase text-ink4"><th className="px-4 py-3">Platillo</th><th className="px-4 py-3">Sucursal</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3 text-right">Precio</th><th className="px-4 py-3 text-right">Vendidos hoy</th><th className="px-4 py-3 text-center">Disponible</th><th className="w-14 px-4 py-3"><span className="sr-only">Acciones</span></th></tr></thead>
            <tbody>
              {loading ? [1, 2, 3, 4, 5].map((row) => <tr key={row} className="animate-pulse border-t border-[#EEE6DC]"><td colSpan={7} className="px-4 py-4"><div className="h-4 rounded bg-bg2" /></td></tr>) : null}
              {!loading && items.length === 0 ? <tr><td colSpan={7} className="px-4 py-14 text-center text-sm text-ink3">No hay platillos configurados para esta selección.</td></tr> : null}
              {!loading ? items.map((item) => (
                <tr key={`${item.id_sucursal}-${item.id_platillo}`} className="border-t border-[#EEE6DC] text-ink2">
                  <td className="px-4 py-3.5"><div className="flex items-center gap-3">{item.imagen_url ? <img src={item.imagen_url} alt="" className="h-9 w-9 rounded-card object-cover" /> : <span className="flex h-9 w-9 items-center justify-center rounded-card bg-bg2 text-ink4"><Image size={16} /></span>}<strong className="font-semibold text-ink">{item.nombre}</strong></div></td>
                  <td className="px-4 py-3.5"><span className="rounded-full bg-bg px-2.5 py-1 text-[10px] font-semibold">{item.sucursal}</span></td>
                  <td className="px-4 py-3.5 text-ink3">{item.categoria}</td>
                  <td className="px-4 py-3.5 text-right"><PriceCell item={item} disabled={saving} onUpdate={(precio) => onUpdate(item, { id_sucursal: item.id_sucursal, precio })} /><span className="sr-only">{fmtSoles(item.precio)}</span></td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums">{item.vendidos_hoy}</td>
                  <td className="px-4 py-3.5 text-center"><Toggle checked={item.disponible} disabled={saving} onChange={() => onUpdate(item, { id_sucursal: item.id_sucursal, disponible: !item.disponible })} /></td>
                  <td className="px-4 py-3.5"><button type="button" title="Retirar del local" disabled={saving} onClick={() => { if (window.confirm(`¿Retirar ${item.nombre} de ${item.sucursal}?`)) onDelete(item); }} className="flex h-9 w-9 items-center justify-center rounded-card text-ink4 hover:bg-danger/10 hover:text-danger disabled:opacity-50"><Trash2 size={15} /></button></td>
                </tr>
              )) : null}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5" role="presentation">
          <form onSubmit={submit} className="w-full max-w-lg rounded-card bg-surface p-6 shadow-lift" aria-labelledby="nuevo-platillo-title">
            <header className="flex items-center justify-between"><div><h2 id="nuevo-platillo-title" className="font-display text-2xl font-semibold text-ink">Nuevo platillo</h2><p className="mt-1 text-xs text-ink4">Añádelo a una sucursal de la red.</p></div><button type="button" onClick={() => setModalOpen(false)} className="flex h-10 w-10 items-center justify-center rounded-card hover:bg-bg"><X size={18} /></button></header>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-ink2">Sucursal<select required value={form.id_sucursal} onChange={(e) => setForm({ ...form, id_sucursal: Number(e.target.value) })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] bg-white px-3 text-sm">{branches.map((branch) => <option key={branch.id_sucursal} value={branch.id_sucursal}>{branch.nombre}</option>)}</select></label>
              <label className="text-xs font-semibold text-ink2">Categoría<select required value={form.id_categoria} onChange={(e) => setForm({ ...form, id_categoria: Number(e.target.value) })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] bg-white px-3 text-sm">{categories.map((category) => <option key={category.id_categoria} value={category.id_categoria}>{category.nombre}</option>)}</select></label>
              <label className="col-span-2 text-xs font-semibold text-ink2">Nombre<input required minLength={2} value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
              <label className="text-xs font-semibold text-ink2">Precio en soles<input required type="number" min="0.1" step="0.1" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
              <label className="text-xs font-semibold text-ink2">Imagen URL<input type="url" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setModalOpen(false)} className="h-10 rounded-card px-4 text-xs font-semibold text-ink3 hover:bg-bg">Cancelar</button><button type="submit" disabled={saving || !form.id_sucursal || !form.id_categoria} className="flex h-10 items-center gap-2 rounded-card bg-ink px-5 text-xs font-semibold text-white disabled:opacity-50">{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />} Crear platillo</button></div>
          </form>
        </div>
      ) : null}
    </>
  );
}
