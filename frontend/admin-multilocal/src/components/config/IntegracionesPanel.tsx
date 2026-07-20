import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Clipboard, ExternalLink, LoaderCircle, Plus, Trash2, X } from 'lucide-react';
import { connectIntegracion, createApiKey, disconnectIntegracion, getApiKeys, getIntegraciones, revokeApiKey } from '../../api/empresa';
import { getApiErrorMessage } from '../../api/errors';
import type { ApiKeyCreada, IntegracionEmpresa } from '../../types/multilocal';

type IntegrationAction = { type: 'connect'; id: number; apiKey: string } | { type: 'disconnect'; id: number };
type KeyAction = { type: 'create'; name: string } | { type: 'revoke'; id: number };

function Toggle({ checked, disabled, onChange }: { checked: boolean; disabled?: boolean; onChange: () => void }) {
  return <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={onChange} className={`relative h-7 w-12 rounded-full ${checked ? 'bg-mint-dark' : 'bg-[#CFC5BA]'} disabled:opacity-50`}><span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} /></button>;
}

export function IntegracionesPanel() {
  const queryClient = useQueryClient();
  const integrations = useQuery({ queryKey: ['integraciones'], queryFn: getIntegraciones });
  const keys = useQuery({ queryKey: ['api-keys'], queryFn: getApiKeys });
  const [credentialFor, setCredentialFor] = useState<number | null>(null);
  const [credential, setCredential] = useState('');
  const [keyName, setKeyName] = useState('');
  const [newToken, setNewToken] = useState<string | null>(null);
  const integrationMutation = useMutation<IntegracionEmpresa | void, Error, IntegrationAction>({
    mutationFn: (action: IntegrationAction) => action.type === 'connect' ? connectIntegracion(action.id, action.apiKey) : disconnectIntegracion(action.id),
    onSuccess: () => {
      setCredentialFor(null);
      setCredential('');
      void queryClient.invalidateQueries({ queryKey: ['integraciones'] });
    },
  });
  const keyMutation = useMutation<ApiKeyCreada | void, Error, KeyAction>({
    mutationFn: (action: KeyAction) => action.type === 'create' ? createApiKey(action.name) : revokeApiKey(action.id),
    onSuccess: (result) => {
      if (result) setNewToken(result.token);
      setKeyName('');
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });
  const error = integrations.isError ? integrations.error : keys.isError ? keys.error : integrationMutation.isError ? integrationMutation.error : keyMutation.isError ? keyMutation.error : null;

  function submitCredential(event: FormEvent) {
    event.preventDefault();
    if (credentialFor) integrationMutation.mutate({ type: 'connect', id: credentialFor, apiKey: credential });
  }

  return (
    <div className="space-y-7">
      {error ? <p role="alert" className="rounded-card border border-danger/25 bg-danger/10 px-4 py-3 text-sm text-danger">{getApiErrorMessage(error)}</p> : null}
      <section>
        <header className="mb-3 flex items-center justify-between"><div><h2 className="font-display text-xl font-semibold text-ink">Conectores</h2><p className="mt-0.5 text-xs text-ink4">{integrations.data?.filter((item) => item.conectado).length ?? 0} de {integrations.data?.length ?? 0} activos</p></div><a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="flex h-10 items-center gap-2 rounded-card border border-[#DED4C8] px-3 text-xs font-semibold text-ink2 hover:bg-surface">Documentación <ExternalLink size={14} /></a></header>
        <div className="grid grid-cols-2 gap-3 max-[850px]:grid-cols-1">
          {integrations.isPending ? [1, 2, 3, 4].map((row) => <div key={row} className="h-40 animate-pulse rounded-card bg-bg2" />) : null}
          {integrations.data?.map((item) => (
            <article key={item.id} className="rounded-card border border-[#E7DED3] bg-surface p-4 shadow-card">
              <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-ink font-display text-lg font-bold text-white">{item.nombre[0]}</span><div className="min-w-0 flex-1"><h3 className="font-semibold text-ink">{item.nombre}</h3><p className="mt-0.5 font-mono text-[9px] uppercase text-ink4">{item.categoria}</p></div><Toggle checked={item.conectado} disabled={integrationMutation.isPending} onChange={() => item.conectado ? integrationMutation.mutate({ type: 'disconnect', id: item.id }) : setCredentialFor(item.id)} /></div>
              <p className="mt-3 text-xs leading-5 text-ink3">{item.descripcion}</p>
              <div className="mt-3 flex items-center justify-between text-[10px]"><span className={`flex items-center gap-1.5 font-semibold ${item.conectado ? 'text-mint-dark' : 'text-ink4'}`}><span className={`h-1.5 w-1.5 rounded-full ${item.conectado ? 'bg-mint' : 'bg-ink4'}`} />{item.conectado ? 'Conectado' : 'Desconectado'}</span>{item.credencial_hint ? <code className="font-mono text-ink4">{item.credencial_hint}</code> : null}</div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <header className="mb-3"><h2 className="font-display text-xl font-semibold text-ink">API keys para desarrolladores</h2><p className="mt-0.5 text-xs text-ink4">Acceso a la API REST y webhooks de UTTOF</p></header>
        {newToken ? <div className="mb-3 rounded-card border border-sun/40 bg-sun/10 p-4"><div className="flex items-center justify-between gap-3"><div><strong className="text-xs text-ink">Guarda esta clave ahora</strong><p className="mt-1 text-[10px] text-ink3">Por seguridad no volverá a mostrarse.</p></div><button type="button" onClick={() => void navigator.clipboard.writeText(newToken)} className="flex h-9 items-center gap-2 rounded-card bg-ink px-3 text-[10px] font-semibold text-white"><Clipboard size={13} /> Copiar</button></div><code className="mt-3 block break-all rounded-card bg-white px-3 py-2 font-mono text-[11px] text-ink2">{newToken}</code></div> : null}
        <form onSubmit={(event) => { event.preventDefault(); keyMutation.mutate({ type: 'create', name: keyName }); }} className="mb-3 flex gap-2"><label className="sr-only" htmlFor="api-key-name">Nombre de la API key</label><input id="api-key-name" required minLength={3} value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Ej. ERP Producción" className="h-10 flex-1 rounded-card border border-[#DED4C8] bg-white px-3 text-xs" /><button type="submit" disabled={keyMutation.isPending} className="flex h-10 items-center gap-2 rounded-card bg-ink px-4 text-xs font-semibold text-white disabled:opacity-50">{keyMutation.isPending ? <LoaderCircle size={15} className="animate-spin" /> : <Plus size={15} />} Generar</button></form>
        <div className="overflow-x-auto rounded-card border border-[#E7DED3] bg-surface"><table className="w-full min-w-[620px] text-xs"><thead><tr className="bg-[#FCF9F5] text-left font-mono text-[9px] uppercase text-ink4"><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Token</th><th className="px-4 py-3">Creada</th><th className="px-4 py-3">Último uso</th><th className="px-4 py-3"><span className="sr-only">Acción</span></th></tr></thead><tbody>{keys.isPending ? <tr><td colSpan={5} className="px-4 py-6 text-center text-ink4">Cargando credenciales...</td></tr> : null}{!keys.isPending && keys.data?.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-ink4">No hay API keys activas.</td></tr> : null}{keys.data?.map((key) => <tr key={key.id} className="border-t border-[#EEE6DC]"><td className="px-4 py-3 font-semibold text-ink">{key.nombre}</td><td className="px-4 py-3 font-mono text-[10px] text-ink3">{key.token_mascara}</td><td className="px-4 py-3 text-ink3">{new Date(key.creada_en).toLocaleDateString('es-PE')}</td><td className="px-4 py-3 text-ink3">{key.ultimo_uso ? new Date(key.ultimo_uso).toLocaleString('es-PE') : 'Sin uso'}</td><td className="px-4 py-3 text-right"><button type="button" title="Revocar API key" onClick={() => keyMutation.mutate({ type: 'revoke', id: key.id })} className="flex h-9 w-9 items-center justify-center rounded-card text-danger hover:bg-danger/10"><Trash2 size={14} /></button></td></tr>)}</tbody></table></div>
      </section>

      {credentialFor ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-5"><form onSubmit={submitCredential} className="w-full max-w-md rounded-card bg-white p-6 shadow-lift"><header className="flex items-center justify-between"><div><h2 className="font-display text-xl font-semibold text-ink">Conectar integración</h2><p className="mt-1 text-xs text-ink4">Ingresa la credencial entregada por el proveedor.</p></div><button type="button" onClick={() => setCredentialFor(null)} className="flex h-10 w-10 items-center justify-center rounded-card hover:bg-bg"><X size={17} /></button></header><label className="mt-5 block text-xs font-semibold text-ink2">API key<input type="password" required minLength={8} value={credential} onChange={(e) => setCredential(e.target.value)} autoComplete="off" className="mt-1.5 h-11 w-full rounded-card border border-[#DED4C8] px-3 text-sm" /></label><button type="submit" disabled={integrationMutation.isPending} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-card bg-ink text-xs font-semibold text-white disabled:opacity-50">{integrationMutation.isPending ? <LoaderCircle size={15} className="animate-spin" /> : <Check size={15} />} Validar y conectar</button></form></div> : null}
    </div>
  );
}
