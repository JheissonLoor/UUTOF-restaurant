// Configuración module

const { useState: useSC } = React;

const CFG_SECTIONS = [
  { id: "restaurante", label: "Restaurante",  ico: IconChef },
  { id: "horarios",    label: "Horarios",     ico: IconClock },
  { id: "pagos",       label: "Pagos",        ico: IconCreditCard },
  { id: "reservas",    label: "Reservas",     ico: IconCalendar },
  { id: "notif",       label: "Notificaciones", ico: IconBell },
];

const RestauranteSection = () => {
  const r = CONFIG_DATA.restaurante;
  return (
    <div className="cfg-section">
      <h3 className="serif">Datos del restaurante</h3>
      <div className="cfg-sub">Información pública y fiscal de tu establecimiento</div>
      <div className="field-row">
        <div className="field">
          <label>Nombre comercial</label>
          <input defaultValue={r.nombre}/>
        </div>
        <div className="field">
          <label>Razón social</label>
          <input defaultValue={r.razon}/>
        </div>
      </div>
      <div className="field-row">
        <div className="field">
          <label>RFC</label>
          <input defaultValue={r.rfc}/>
        </div>
        <div className="field">
          <label>Capacidad total</label>
          <input defaultValue={r.capacidad} type="number"/>
        </div>
      </div>
      <div className="field">
        <label>Dirección</label>
        <input defaultValue={r.direccion}/>
      </div>
      <div className="field-row">
        <div className="field">
          <label>Teléfono</label>
          <input defaultValue={r.telefono}/>
        </div>
        <div className="field">
          <label>Email de contacto</label>
          <input defaultValue={r.email}/>
        </div>
      </div>
    </div>
  );
};

const HorariosSection = () => {
  const [hours, setHours] = useSC(CONFIG_DATA.horarios);
  const toggle = (i) => setHours(h => h.map((d, idx) => idx === i ? { ...d, closed: !d.closed } : d));
  return (
    <div className="cfg-section">
      <h3 className="serif">Horarios de atención</h3>
      <div className="cfg-sub">Define los horarios en los que el restaurante atiende clientes</div>
      {hours.map((d, i) => (
        <div key={d.day} className={`hours-grid ${d.closed ? "closed" : ""}`}>
          <div className="day-name">{d.day}</div>
          <div className="time-field">
            <input type="time" defaultValue={d.open} disabled={d.closed}/>
          </div>
          <div className="time-field">
            <input type="time" defaultValue={d.close} disabled={d.closed}/>
          </div>
          <div className={`toggle ${!d.closed ? "on" : ""}`} onClick={() => toggle(i)} style={{ cursor: "pointer" }}>
            <div className="switch"/>
            <span style={{ fontSize: 12, color: d.closed ? "var(--ink-400)" : "var(--sage-500)", fontWeight: 600, minWidth: 50 }}>
              {d.closed ? "Cerrado" : "Abierto"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const PagosSection = () => {
  const [pagos, setPagos] = useSC(CONFIG_DATA.pagos);
  const toggle = (id) => setPagos(p => p.map(x => x.id === id ? { ...x, on: !x.on } : x));
  const icoMap = { IconCreditCard, IconCash, IconReceipt, IconPackage };
  return (
    <div className="cfg-section">
      <h3 className="serif">Métodos de pago habilitados</h3>
      <div className="cfg-sub">Controla qué formas de pago aceptas en tu restaurante</div>
      {pagos.map(p => {
        const Ico = icoMap[p.icon];
        return (
          <div key={p.id} className="pay-method-card">
            <div className="ico-wrap" style={{ background: p.bg, color: p.color }}>
              <Ico size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-500)" }}>{p.sub}</div>
            </div>
            <div className={`toggle ${p.on ? "on" : ""}`} onClick={() => toggle(p.id)} style={{ cursor: "pointer" }}>
              <div className="switch"/>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ReservasSection = () => {
  const r = CONFIG_DATA.reservas;
  return (
    <div className="cfg-section">
      <h3 className="serif">Reservaciones</h3>
      <div className="cfg-sub">Política de reservas y tiempo máximo anticipado</div>
      <div className="field-row">
        <div className="field">
          <label>Anticipación máxima (días)</label>
          <input type="number" defaultValue={r.anticipacionMax}/>
        </div>
        <div className="field">
          <label>Anticipación mínima (horas)</label>
          <input type="number" defaultValue={r.anticipacionMin}/>
        </div>
      </div>
      <div className="field">
        <label>Duración por defecto (minutos)</label>
        <input type="number" defaultValue={r.duracionDefault}/>
      </div>
      <div className="field">
        <label>Política de cancelación</label>
        <textarea defaultValue="Cancelación gratuita hasta 2 horas antes. Posterior a eso se cobra el 50% del anticipo."/>
      </div>
    </div>
  );
};

const NotifSection = () => {
  const [notifs, setNotifs] = useSC(CONFIG_DATA.notificaciones);
  const toggle = (id, ch) => setNotifs(n => n.map(x => x.id === id ? { ...x, channels: { ...x.channels, [ch]: !x.channels[ch] } } : x));
  const chanCfg = { app: "App", email: "Email", sms: "SMS" };
  return (
    <div className="cfg-section">
      <h3 className="serif">Notificaciones</h3>
      <div className="cfg-sub">Elige qué eventos quieres recibir y por qué canal</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 4, fontSize: 11, color: "var(--ink-500)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 4, paddingBottom: 6, borderBottom: "1px solid var(--border)" }}>
        <div>Evento</div>
        <div>Canales</div>
      </div>
      {notifs.map(n => (
        <div key={n.id} className="notif-row">
          <div>
            <div className="title">{n.title}</div>
            <div className="sub">{n.sub}</div>
          </div>
          <div className="chan-dots">
            {Object.keys(chanCfg).map(ch => (
              <button key={ch} className={`chan-dot ${n.channels[ch] ? "on" : ""}`}
                      onClick={() => toggle(n.id, ch)} title={chanCfg[ch]}>
                <span style={{ fontSize: 10, fontWeight: 700 }}>{chanCfg[ch][0]}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ConfigPage = () => {
  const [section, setSection] = useSC("restaurante");
  const sections = {
    restaurante: <RestauranteSection/>,
    horarios: <HorariosSection/>,
    pagos: <PagosSection/>,
    reservas: <ReservasSection/>,
    notif: <NotifSection/>,
  };
  return (
    <>
      <div className="mod-head">
        <div>
          <h2 className="serif">Configuración del sistema</h2>
          <div className="mod-sub">Ajustes generales del restaurante y preferencias</div>
        </div>
        <div className="mod-head-actions">
          <button className="btn">Descartar</button>
          <button className="btn btn-accent"><IconCheck size={15}/> Guardar cambios</button>
        </div>
      </div>
      <div className="cfg-layout">
        <div className="cfg-nav">
          {CFG_SECTIONS.map(s => {
            const Ico = s.ico;
            return (
              <button key={s.id} className={section === s.id ? "active" : ""}
                      onClick={() => setSection(s.id)}>
                <Ico size={15}/> {s.label}
              </button>
            );
          })}
        </div>
        <div>
          {sections[section]}
        </div>
      </div>
    </>
  );
};

window.ConfigPage = ConfigPage;
