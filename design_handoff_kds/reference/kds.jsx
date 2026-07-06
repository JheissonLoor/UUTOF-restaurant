// UTTOF — KDS (Kitchen Display System)
// Pantalla de cocina para staff

const { useState: useKS, useEffect: useKE, useMemo: useKM, useRef: useKR } = React;

// Icons
const KIcon = ({ size = 16, sw = 1.8, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);
const KFlame  = (p) => <KIcon {...p}><path d="M12 22c4 0 7-3 7-7 0-4-4-6-4-10 0 0-3 1-5 5-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z"/></KIcon>;
const KClock  = (p) => <KIcon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></KIcon>;
const KCheck  = (p) => <KIcon {...p}><path d="m4 12 5 5L20 6"/></KIcon>;
const KBell   = (p) => <KIcon {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2.5H4.5L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/></KIcon>;
const KMore   = (p) => <KIcon {...p}><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></KIcon>;
const KAlert  = (p) => <KIcon {...p}><path d="M12 2 2 21h20L12 2z"/><path d="M12 9v5M12 18v.01"/></KIcon>;
const KPlate  = (p) => <KIcon {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></KIcon>;
const KPause  = (p) => <KIcon {...p}><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></KIcon>;
const KMaximize=(p) => <KIcon {...p}><path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6"/></KIcon>;
const KZap    = (p) => <KIcon {...p}><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7z"/></KIcon>;

// Mock tickets
const initTickets = () => [
  { id: "T-2089", num: 89, table: "Mesa 5", source: "App cliente", waiter: "Carla",
    status: "urgent", elapsed: 18*60, target: 22*60, items: [
      { name: "Lomo Saltado", qty: 1, mods: ["Término medio"], allergens: [], done: true },
      { name: "Chicha Morada", qty: 2, mods: ["Sin hielo"], done: true },
      { name: "Suspiro a la Limena", qty: 1, mods: [], note: "Sin canela", done: false },
    ] },
  { id: "T-2090", num: 90, table: "Mesa 12", source: "Mesero", waiter: "Diego",
    status: "cooking", elapsed: 8*60, target: 18*60, items: [
      { name: "Arroz con Mariscos", qty: 2, mods: ["Bien cocido"], allergens: ["mariscos"], done: true },
      { name: "Causa Limena", qty: 2, mods: ["Sin ají"], allergens: ["huevo"], done: false },
      { name: "Pisco Sour", qty: 4, mods: [], done: false },
    ] },
  { id: "T-2091", num: 91, table: "Mesa 3", source: "App cliente", waiter: "Carla",
    status: "new", elapsed: 1*60+20, target: 14*60, items: [
      { name: "Ají de Gallina", qty: 1, mods: [], allergens: ["lácteos","nueces"], done: false },
      { name: "Papa a la Huancaina", qty: 1, mods: [], done: false },
      { name: "Chicha Morada", qty: 2, mods: ["Extra hierbabuena"], done: false },
    ] },
  { id: "T-2092", num: 92, table: "Mesa 9", source: "Mesero", waiter: "Sofía",
    status: "ready", elapsed: 14*60, target: 14*60, items: [
      { name: "Ceviche Clásico", qty: 3, mods: [], allergens: ["pescado"], done: true },
      { name: "Tiradito de Pescado", qty: 1, mods: ["Extra picante"], done: true },
      { name: "Pisco Sour", qty: 2, mods: [], done: true },
    ] },
  { id: "T-2093", num: 93, table: "Mesa 7", source: "App cliente", waiter: "Diego",
    status: "cooking", elapsed: 11*60, target: 18*60, items: [
      { name: "Pollo a la Brasa", qty: 2, mods: ["Sin sal extra"], note: "Cliente alérgico", done: true },
      { name: "Tiradito de Pescado", qty: 1, mods: [], done: false },
      { name: "Picarones", qty: 2, mods: [], allergens: ["gluten"], done: false },
    ] },
  { id: "T-2094", num: 94, table: "Mesa 1", source: "Mesero", waiter: "Carla",
    status: "new", elapsed: 35, target: 12*60, items: [
      { name: "Papa a la Huancaina", qty: 2, mods: [], done: false },
      { name: "Chicha Morada", qty: 2, mods: [], done: false },
    ] },
  { id: "T-2095", num: 95, table: "Mesa 11", source: "App cliente", waiter: "Sofía",
    status: "cooking", elapsed: 6*60, target: 18*60, items: [
      { name: "Arroz con Mariscos", qty: 1, mods: [], done: true },
      { name: "Ceviche Clásico", qty: 1, mods: ["Sin cebolla"], allergens: ["pescado"], done: false },
    ] },
];

const fmtMMSS = (s) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
};

const Ticket = ({ t, onToggleItem, onAdvance }) => {
  const doneCount = t.items.filter(i => i.done).length;
  const progress = (doneCount / t.items.length) * 100;
  const overdue = t.elapsed > t.target;

  return (
    <div className={`ticket ${t.status}`}>
      <div className="ticket-strip"/>
      <div className="ticket-head">
        <div className="ticket-num">#{t.num}</div>
        <div className="meta">
          <div className="ticket-table"><b>{t.table}</b></div>
          <div className="ticket-source">
            {t.source === "App cliente" ? <KZap size={10}/> : <KPlate size={10}/>} {t.source} · {t.waiter}
          </div>
        </div>
        <div className="ticket-timer">
          <div className="time tnum">{fmtMMSS(t.elapsed)}</div>
          <div className="lbl">{overdue ? "Sobre tiempo" : `de ${fmtMMSS(t.target)}`}</div>
        </div>
      </div>

      <div className="ticket-progress">
        <span className="tnum">{doneCount}/{t.items.length}</span>
        <div className="bar"><div className="fill" style={{ width: `${progress}%` }}/></div>
      </div>

      <div className="ticket-items">
        {t.items.map((it, i) => (
          <div key={i} className={`ti-item ${it.done ? "done" : ""}`} onClick={() => onToggleItem(t.id, i)}>
            <div className="ti-qty">{it.qty}</div>
            <div>
              <div className="ti-name">{it.name}</div>
              {(it.mods?.length > 0 || it.note || it.allergens?.length > 0) && (
                <div className="ti-mods">
                  {it.mods?.map((m, j) => <span key={j} className="ti-mod">{m}</span>)}
                  {it.note && <span className="ti-mod note">⚠ {it.note}</span>}
                  {it.allergens?.length > 0 && <span className="ti-mod allergy">{it.allergens.join(" · ")}</span>}
                </div>
              )}
            </div>
            <div className="ti-check">{it.done && <KCheck size={13} sw={2.5}/>}</div>
          </div>
        ))}
      </div>

      <div className="ticket-foot">
        {t.status === "ready" ? (
          <button className="k-btn success" onClick={() => onAdvance(t.id)}>
            <KCheck size={14} sw={2.4}/> Entregado
          </button>
        ) : (
          <button className="k-btn primary" onClick={() => onAdvance(t.id)}
                  disabled={doneCount !== t.items.length}>
            {doneCount === t.items.length ? <><KBell size={14}/> Listo para servir</> : <><KFlame size={14}/> En preparación</>}
          </button>
        )}
        <button className="k-btn ghost" title="Más"><KMore size={16}/></button>
      </div>
    </div>
  );
};

const KDS = () => {
  const [tickets, setTickets] = useKS(initTickets);
  const [filter, setFilter] = useKS("activos");
  const [view, setView] = useKS("cards");
  const [now, setNow] = useKS(new Date());

  // Simular tiempo corriendo
  useKE(() => {
    const id = setInterval(() => {
      setNow(new Date());
      setTickets(ts => ts.map(t => {
        if (t.status === "ready" || t.status === "delivered") return t;
        const e = t.elapsed + 1;
        let st = t.status;
        if (e > t.target * 0.95 && st !== "urgent") st = "urgent";
        return { ...t, elapsed: e, status: st };
      }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const counts = useKM(() => ({
    activos: tickets.filter(t => t.status !== "delivered").length,
    nuevos: tickets.filter(t => t.status === "new").length,
    cocinando: tickets.filter(t => t.status === "cooking").length,
    urgentes: tickets.filter(t => t.status === "urgent").length,
    listos: tickets.filter(t => t.status === "ready").length,
  }), [tickets]);

  const filtered = useKM(() => {
    if (filter === "activos") return tickets.filter(t => t.status !== "delivered");
    if (filter === "todos") return tickets;
    return tickets.filter(t => t.status === filter);
  }, [tickets, filter]);

  const onToggleItem = (tid, idx) => setTickets(ts => ts.map(t => {
    if (t.id !== tid) return t;
    const items = t.items.map((it, i) => i === idx ? { ...it, done: !it.done } : it);
    const allDone = items.every(it => it.done);
    let st = t.status;
    if (allDone && st !== "ready") st = "ready";
    if (!allDone && st === "ready") st = "cooking";
    return { ...t, items, status: st };
  }));

  const onAdvance = (tid) => setTickets(ts => ts.map(t => {
    if (t.id !== tid) return t;
    if (t.status === "ready") return { ...t, status: "delivered" };
    if (t.status === "new") return { ...t, status: "cooking" };
    return t;
  }).filter(t => t.status !== "delivered" || true));

  const avgWait = useKM(() => {
    const active = tickets.filter(t => t.status !== "delivered" && t.status !== "ready");
    if (!active.length) return 0;
    return Math.round(active.reduce((s, t) => s + t.elapsed, 0) / active.length / 60);
  }, [tickets]);

  return (
    <div className="kds">
      <header className="kds-top">
        <div className="kds-brand">
          <div className="kds-brand-mark">U</div>
          <span className="kds-brand-name">UTTOF</span>
          <span className="kds-brand-tag">Cocina · KDS</span>
        </div>
        <div className="kds-stats">
          <div className="kds-stat">
            <span className="ico coral"><KFlame size={12}/></span>
            <span className="kds-stat-val tnum">{counts.cocinando + counts.urgentes}</span>
            <span className="lbl">en preparación</span>
          </div>
          <div className="kds-stat">
            <span className="ico sun"><KBell size={12}/></span>
            <span className="kds-stat-val tnum">{counts.nuevos}</span>
            <span className="lbl">nuevos</span>
          </div>
          <div className="kds-stat">
            <span className="ico mint"><KCheck size={12}/></span>
            <span className="kds-stat-val tnum">{counts.listos}</span>
            <span className="lbl">listos</span>
          </div>
        </div>
        <div className="kds-clock">
          <div>
            <div className="kds-clock-time tnum">{now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}</div>
            <div className="kds-clock-date">Mié · 29 Abr</div>
          </div>
          <div className="kds-cook-chip">
            <div className="kds-cook-avatar">M</div>
            Chef Mario
          </div>
        </div>
      </header>

      <div className="kds-filters">
        {[
          { id: "activos", label: "Activos", count: counts.activos },
          { id: "new", label: "Nuevos", count: counts.nuevos },
          { id: "cooking", label: "Cocinando", count: counts.cocinando },
          { id: "urgent", label: "Urgentes", count: counts.urgentes },
          { id: "ready", label: "Listos", count: counts.listos },
        ].map(t => (
          <button key={t.id} className={`kds-tab ${filter === t.id ? "active" : ""}`} onClick={() => setFilter(t.id)}>
            {t.id === "urgent" && <KAlert size={13}/>}
            {t.id === "ready" && <KCheck size={13}/>}
            {t.label}
            <span className="badge">{t.count}</span>
          </button>
        ))}
        <div className="kds-spacer"/>
        <div className="kds-view-toggle">
          <button className={view === "cards" ? "active" : ""} onClick={() => setView("cards")}>Tarjetas</button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>Lista</button>
        </div>
        <button className="k-btn ghost" title="Pantalla completa" style={{ width: 36 }}><KMaximize size={15}/></button>
      </div>

      <main className="kds-board">
        {filtered.map(t => (
          <Ticket key={t.id} t={t} onToggleItem={onToggleItem} onAdvance={onAdvance}/>
        ))}
      </main>

      <footer className="kds-bottom">
        <div className="kds-legend">
          <span className="kds-legend-it"><span className="dot" style={{ background: "#F5C04A" }}/>Nuevo</span>
          <span className="kds-legend-it"><span className="dot" style={{ background: "#F26B53" }}/>Cocinando</span>
          <span className="kds-legend-it"><span className="dot" style={{ background: "#FF5C42" }}/>Urgente</span>
          <span className="kds-legend-it"><span className="dot" style={{ background: "#5BD4B0" }}/>Listo</span>
        </div>
        <div className="spacer"/>
        <div className="kds-stat-pill">Tiempo prom: <b className="tnum">{avgWait} min</b></div>
        <div className="kds-stat-pill">Pico hoy: <b className="tnum">14:32</b></div>
        <div className="kds-stat-pill">Tickets servidos: <b className="tnum">42</b></div>
      </footer>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<KDS/>);
