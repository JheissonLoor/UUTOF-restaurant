import { useEffect, useState } from 'react';
import { useAuth } from '../auth/useAuth';
import { ConfigTabs, type ConfigTab } from '../components/config/ConfigTabs';
import { FacturacionPanel } from '../components/config/FacturacionPanel';
import { GeneralPanel } from '../components/config/GeneralPanel';
import { IntegracionesPanel } from '../components/config/IntegracionesPanel';
import { MarcaBlancaPanel } from '../components/config/MarcaBlancaPanel';
import { TopBar } from '../layout/TopBar';

interface ConfigViewProps { initialTab?: ConfigTab }

export function ConfigView({ initialTab = 'general' }: ConfigViewProps) {
  const { usuario } = useAuth();
  const globalAccess = usuario?.rol !== 'gerente_sucursal';
  const [tab, setTab] = useState<ConfigTab>(globalAccess ? initialTab : 'general');
  useEffect(() => { setTab(globalAccess ? initialTab : 'general'); }, [globalAccess, initialTab]);
  if (!globalAccess) return <section className="animate-view-in"><TopBar title="Configuración" subtitle="Ajustes de la red" /><div className="rounded-card border border-sun/40 bg-sun/10 px-5 py-4 text-sm text-sun-dark">La configuración global está disponible únicamente para el dueño de la red.</div></section>;
  return (
    <section className="animate-view-in" aria-labelledby="titulo-config">
      <TopBar title="Configuración" subtitle="Ajustes de la red · plan Multi-local" titleId="titulo-config" />
      <ConfigTabs value={tab} onChange={setTab} globalAccess={globalAccess} />
      {tab === 'general' ? <GeneralPanel /> : null}
      {tab === 'integraciones' ? <IntegracionesPanel /> : null}
      {tab === 'marca' ? <MarcaBlancaPanel /> : null}
      {tab === 'facturacion' ? <FacturacionPanel /> : null}
    </section>
  );
}
