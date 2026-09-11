import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useNavigate } from 'react-router-dom';

import { getPreferencias, savePreferencias } from '@/api/cliente';
import { getErrorDetail } from '@/api/errors';
import { useAuth } from '@/auth/useAuth';
import { CheckIcon } from '@/components/icons';
import type { CocinaFavorita, DietaCliente } from '@/types';


const diets: Array<{ id: DietaCliente; label: string }> = [
  { id: 'sin_restricciones', label: 'Sin restricciones' },
  { id: 'vegetariana', label: 'Vegetariana' },
  { id: 'vegana', label: 'Vegana' },
  { id: 'sin_gluten', label: 'Sin gluten' },
];

const cuisines: Array<{ id: CocinaFavorita; label: string }> = [
  { id: 'criolla', label: 'Criolla' }, { id: 'marina', label: 'Marina' },
  { id: 'parrilla', label: 'Parrilla' }, { id: 'chifa', label: 'Chifa' },
  { id: 'nikkei', label: 'Nikkei' }, { id: 'postres', label: 'Postres' },
  { id: 'vegetariana', label: 'Vegetariana' }, { id: 'picante', label: 'Picante' },
];

export function PreferencesPage(): JSX.Element {
  const { isAuthenticated, isGuest } = useAuth();
  const navigate = useNavigate();
  const preferencesQuery = useQuery({ queryKey: ['cliente', 'preferencias'], queryFn: getPreferencias, enabled: isAuthenticated && !isGuest });
  const [diet, setDiet] = useState<DietaCliente>('sin_restricciones');
  const [selected, setSelected] = useState<CocinaFavorita[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!preferencesQuery.data) return;
    setDiet(preferencesQuery.data.dieta);
    setSelected(preferencesQuery.data.cocinas);
  }, [preferencesQuery.data]);

  if (!isAuthenticated || isGuest) return <Navigate to="/registro" replace />;

  function toggleCuisine(cuisine: CocinaFavorita): void {
    setSelected((current) => current.includes(cuisine) ? current.filter((item) => item !== cuisine) : [...current, cuisine]);
  }

  async function handleSave(): Promise<void> {
    setSaving(true);
    setError(null);
    try {
      await savePreferencias({ dieta: diet, cocinas: selected });
      navigate('/inicio');
    } catch (saveError) {
      setError(getErrorDetail(saveError, 'No se pudieron guardar tus preferencias.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-[100dvh] max-w-[520px] bg-cream-bg px-5 py-10 text-ink-900">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-coral-600">Tu experiencia UTTOF</p>
      <h1 className="mt-2 font-serif text-[38px] font-semibold leading-tight">¿Qué sabores disfrutas?</h1>
      <p className="mt-3 text-sm leading-6 text-ink-500">Estas preferencias se guardan en tu cuenta. Podrás cambiarlas cuando quieras.</p>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">Alimentación</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {diets.map((item) => (
            <button key={item.id} type="button" className={`min-h-14 rounded-md border px-3 text-sm font-semibold ${diet === item.id ? 'border-coral bg-coral-50 text-coral-700' : 'border-[rgba(31,26,20,0.10)] bg-cream-surface text-ink-500'}`} onClick={() => setDiet(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-2xl font-semibold">Cocinas favoritas</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {cuisines.map((item) => {
            const active = selected.includes(item.id);
            return <button key={item.id} type="button" className={`flex min-h-14 items-center justify-between rounded-md border px-4 text-sm font-semibold ${active ? 'border-mint bg-mint-50 text-mint-600' : 'border-[rgba(31,26,20,0.10)] bg-cream-surface text-ink-500'}`} onClick={() => toggleCuisine(item.id)}>{item.label}{active ? <CheckIcon size={15} /> : null}</button>;
          })}
        </div>
      </section>

      {error ? <p className="mt-5 rounded-md bg-coral-50 px-3 py-2 text-sm text-coral-700">{error}</p> : null}
      <button type="button" disabled={saving} className="mt-8 min-h-12 w-full rounded-md bg-coral px-4 text-sm font-semibold text-white disabled:opacity-60" onClick={() => void handleSave()}>{saving ? 'Guardando...' : 'Guardar y continuar'}</button>
      <button type="button" className="mt-2 min-h-11 w-full text-sm font-semibold text-ink-400" onClick={() => navigate('/inicio')}>Ahora no</button>
    </main>
  );
}
