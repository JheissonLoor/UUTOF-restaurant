// Reservas module — gestión de reservaciones del día

const { useState: useRS, useMemo: useRM } = React;

const RESERVA_STATUS = {
  confirmed: { label: "Confirmada", color: "var(--sage-500)",     bg: "var(--sage-100)",      ink: "#2f7d68" },
  pending:   { label: "Por confirmar", color: "var(--saffron-500)", bg: "var(--saffron-100)", ink: "#8a6515" },
  seated:    { label: "Sentada",    color: "var(--terracotta-500)", bg: "var(--terracotta-50)", ink: "var(--terracotta-700)" },
  waitlist:  { label: "Lista de espera", color: "var(--sky-500)",  bg: "var(--sky-100)",       ink: "#3b6481" },
  "no-show": { label: "No-show",    color: "var(--ink-400)",        bg: "var(--cream-200)",     ink: "var(--ink-500)" },
  cancelled: { label: "Cancelada",  color: "var(--wine-500)",       bg: "var(--wine-100)",      ink: "#852e23" },
};

const ReservasStats = ({ data }) => {
  const total = data.length;
  const confirmadas = data.filter(r => r.status === "confirmed").length;
  const sentadas = data.filter(r => r.status === "seated").length;
  const pendientes = data.filter(r => r.status === "pending").length;
  const personas = data.filter(r => r.status !== "no-show" && r.status !== "cancelled")
                       .reduce((a, r) => a + r.people, 0);
  const items = [
    { label: "Reservas hoy", value: total, sub: `${confirmadas} confirmadas · ${pendientes} pendientes`,
      bg: "var(--terracotta-50)", color: "var(--terracotta-500)", ico: IconCalendar },
    { label: "Comensales",   value: personas, sub: "Esperados en el día",
      bg: "var(--sage-100)", color: "var(--sage-500)", ico: IconUsers },
    { label: "Ahora sentadas", value: sentadas, sub: "Mesas con reserva activa",
      bg: "var(--saffron-100)", color: "var(--saffron-500)", ico: IconCheck },
    { label: "Próximas 2h", value: data.filter(r => {
        if (r.status !== "confirmed" && r.status !== "pending") return false;
        const [h, m] = r.time.split(":").map(Number);
        const mins = h * 60 + m;
        const now = 14 * 60 + 0; // 14:00 demo
        return mins >= now && mins <= now + 120;
      }).length, sub: "Requieren preparación",
      bg: "var(--sky-100)", color: "var(--sky-500)", ico: IconClock },
  ];
  return (
    <div className="menu-summary">
      {items.map((s, i) => {
        const Ico = s.ico;
        return (
          <div key={i} className="summary-card">
            <div className="ico-wrap" style={{ background: s.bg, color: s.color }}>
              <Ico size={18}/>
            </div>
            <div>
              <div className="label">{s.label}</div>
              <div className="value serif tnum">{s.value}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ReservaCard = ({ r, onAction, selected, onSelect }) => {
  const cfg = RESERVA_STATUS[r.status];
  const initials = r.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`rv-card ${selected ? "selected" : ""}`} onClick={onSelect}>
      <div className="rv-card-time">
        <div className="rv-time-h serif tnum">{r.time}</div>
        <div className="rv-time-meta">{r.duration} min</div>
      </div>
      <div className="rv-card-body">
        <div className="rv-card-top">
          <div className="rv-card-name">
            <div className="rv-avatar" style={{ background: cfg.bg, color: cfg.ink }}>{initials}</div>
            <div>
              <div className="rv-name-line">
                {r.name}
                {r.vip && <span className="rv-vip">★ VIP</span>}
              </div>
              <div className="rv-name-sub">
                <IconUsers size={11}/> {r.people} pax
                <span className="dot-sep">·</span>
                {r.mesa ? `Mesa ${String(r.mesa).padStart(2, "0")}` : <span style={{ color: "var(--saffron-500)" }}>Sin asignar</span>}
                <span className="dot-sep">·</span>
                <span style={{ textTransform: "capitalize" }}>{r.zone}</span>
              </div>
            </div>
          </div>
          <span className="rv-status" style={{ background: cfg.bg, color: cfg.ink, borderColor: cfg.color }}>
            <span className="rv-status-dot" style={{ background: cfg.color }}/>
            {cfg.label}
          </span>
        </div>
        {r.notes && (
          <div className="rv-notes">
            <IconAlertTriangle size={12}/> <span>{r.notes}</span>
          </div>
        )}
        <div className="rv-card-foot">
          <span className="rv-source">via {r.source}</span>
          <span className="rv-id tnum">#{r.id}</span>
        </div>
      </div>
    </div>
  );
};

const ReservaDetail = ({ r, onAction }) => {
  if (!r) {
    return (
      <div className="table-detail" style={{ textAlign: "center", padding: 32 }}>
        <IconCalendar size={32} style={{ color: "var(--ink-300)", margin: "0 auto 10px", display: "block" }}/>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink-700)", marginBottom: 4 }}>Selecciona una reserva</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>Haz clic en una tarjeta para ver detalles y gestionarla</div>
      </div>
    );
  }
  const cfg = RESERVA_STATUS[r.status];
  return (
    <div className="table-detail">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-500)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>{r.id}</div>
          <div className="td-big serif" style={{ fontSize: 28, lineHeight: 1.1 }}>{r.name}</div>
          {r.vip && <span className="rv-vip" style={{ marginTop: 4, display: "inline-block" }}>★ VIP</span>}
        </div>
        <span className="rv-status" style={{ background: cfg.bg, color: cfg.ink, borderColor: cfg.color, fontSize: 11 }}>
          <span className="rv-status-dot" style={{ background: cfg.color }}/>
          {cfg.label}
        </span>
      </div>

      <div className="td-row"><span className="k">Fecha</span><span className="v">26 May 2026</span></div>
      <div className="td-row"><span className="k">Hora</span><span className="v tnum">{r.time} <span style={{ color: "var(--ink-400)" }}>· {r.duration} min</span></span></div>
      <div className="td-row"><span className="k">Personas</span><span className="v">{r.people} pax</span></div>
      <div className="td-row"><span className="k">Mesa</span><span className="v">{r.mesa ? `#${String(r.mesa).padStart(2, "0")} · ${r.zone}` : <span style={{ color: "var(--saffron-500)" }}>Sin asignar</span>}</span></div>
      <div className="td-row"><span className="k">Origen</span><span className="v">{r.source}</span></div>
      {r.arrived && <div className="td-row"><span className="k">Llegada</span><span className="v tnum">{r.arrived}</span></div>}

      <div style={{ marginTop: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "var(--ink-500)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Contacto</div>
        <div className="rv-contact">
          <span><IconPhone size={12}/> {r.phone}</span>
          <span style={{ marginTop: 4 }}><IconMail size={12}/> {r.email}</span>
        </div>
      </div>

      {r.notes && (
        <div className="rv-note-box">
          <div className="rv-note-label">Notas especiales</div>
          <div className="rv-note-text">{r.notes}</div>
        </div>
      )}

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: "var(--ink-500)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Acciones</div>
        <div className="rv-actions">
          {r.status === "pending" && (
            <button className="btn btn-accent" onClick={() => onAction(r.id, "confirmed")}>
              <IconCheck size={13}/> Confirmar
            </button>
          )}
          {(r.status === "confirmed" || r.status === "waitlist") && (
            <button className="btn btn-accent" onClick={() => onAction(r.id, "seated")}>
              <IconUsers size={13}/> Marcar sentada
            </button>
          )}
          {r.status === "seated" && (
            <button className="btn"><IconReceipt size={13}/> Ver pedido</button>
          )}
          <button className="btn"><IconBell size={13}/> Recordatorio</button>
          <button className="btn"><IconMessage size={13}/> Mensaje</button>
          {r.status !== "cancelled" && r.status !== "no-show" && (
            <button className="btn rv-btn-danger" onClick={() => onAction(r.id, "cancelled")}>
              <IconX size={13}/> Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Timeline = ({ data, onSelect, selectedId }) => {
  // Hours 13:00 - 22:00
  const hours = Array.from({ length: 10 }, (_, i) => 13 + i);
  const now = 14 * 60 + 0; // demo current time
  const minToPx = (m) => ((m - 13 * 60) / 60) * 110;
  return (
    <div className="rv-timeline">
      <div className="rv-tl-axis">
        {hours.map(h => (
          <div key={h} className="rv-tl-hour" style={{ left: ((h - 13) * 110) }}>
            <span className="rv-tl-h-num tnum">{String(h).padStart(2, "0")}:00</span>
          </div>
        ))}
        <div className="rv-tl-now" style={{ left: minToPx(now) }}>
          <span className="rv-tl-now-lbl">Ahora · 14:00</span>
        </div>
      </div>
      <div className="rv-tl-lanes">
        {data.filter(r => r.status !== "no-show" && r.status !== "cancelled").map((r, i) => {
          const [h, m] = r.time.split(":").map(Number);
          const start = minToPx(h * 60 + m);
          const width = (r.duration / 60) * 110;
          const cfg = RESERVA_STATUS[r.status];
          return (
            <div key={r.id} className={`rv-tl-block ${selectedId === r.id ? "selected" : ""}`}
                 onClick={() => onSelect(r.id)}
                 style={{ left: start, width: width - 4, background: cfg.bg, borderColor: cfg.color, color: cfg.ink }}>
              <div className="rv-tl-block-top">
                <span className="rv-tl-name">{r.name.split(" ")[0]} · {r.people}p</span>
                {r.vip && <span>★</span>}
              </div>
              <div className="rv-tl-meta">{r.mesa ? `M${String(r.mesa).padStart(2, "0")}` : "—"} · {r.time}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReservasPage = () => {
  const [data, setData] = useRS(RESERVAS_DATA);
  const [selectedId, setSelectedId] = useRS(data[0]?.id);
  const [filter, setFilter] = useRS("todas");
  const [view, setView] = useRS("lista"); // lista | timeline

  const filtered = useRM(() => {
    if (filter === "todas") return data;
    return data.filter(r => r.status === filter);
  }, [data, filter]);

  const sorted = useRM(() => [...filtered].sort((a, b) => a.time.localeCompare(b.time)), [filtered]);

  const current = data.find(r => r.id === selectedId);
  const setStatus = (id, status) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <>
      <div className="mod-head">
        <div>
          <h2 className="serif">Reservaciones</h2>
          <div className="mod-sub">Martes 26 de mayo · {data.length} reservas para hoy</div>
        </div>
        <div className="mod-head-actions">
          <div className="seg" style={{ marginRight: 4 }}>
            <button className={view === "lista" ? "active" : ""} onClick={() => setView("lista")}>Lista</button>
            <button className={view === "timeline" ? "active" : ""} onClick={() => setView("timeline")}>Timeline</button>
          </div>
          <button className="btn"><IconCalendar size={15}/> 26 May 2026</button>
          <button className="btn btn-accent"><IconPlus size={15}/> Nueva reserva</button>
        </div>
      </div>

      <ReservasStats data={data}/>

      <div className="rv-filters">
        {[
          { id: "todas",     label: "Todas" },
          { id: "confirmed", label: "Confirmadas" },
          { id: "pending",   label: "Por confirmar" },
          { id: "seated",    label: "Sentadas" },
          { id: "waitlist",  label: "Lista de espera" },
          { id: "no-show",   label: "No-show" },
        ].map(f => {
          const count = f.id === "todas" ? data.length : data.filter(r => r.status === f.id).length;
          return (
            <button key={f.id} className={`rv-filter ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
              {f.label} <span className="rv-filter-count">{count}</span>
            </button>
          );
        })}
      </div>

      {view === "timeline" && (
        <div className="card" style={{ padding: 20, marginBottom: 16, overflow: "hidden" }}>
          <div className="card-head" style={{ marginBottom: 16 }}>
            <h3>Vista de horario · {filtered.length} reservas activas</h3>
            <div style={{ fontSize: 12, color: "var(--ink-500)" }}>13:00 — 22:00 · cada bloque = duración real</div>
          </div>
          <div style={{ overflow: "auto" }}>
            <Timeline data={filtered} onSelect={setSelectedId} selectedId={selectedId}/>
          </div>
        </div>
      )}

      <div className="rv-layout">
        <div className="rv-list">
          {sorted.length === 0 ? (
            <div className="rv-empty">No hay reservas con este filtro</div>
          ) : sorted.map(r => (
            <ReservaCard key={r.id} r={r}
                         selected={selectedId === r.id}
                         onSelect={() => setSelectedId(r.id)}
                         onAction={setStatus}/>
          ))}
        </div>

        <div className="rv-side">
          <ReservaDetail r={current} onAction={setStatus}/>
        </div>
      </div>
    </>
  );
};

window.ReservasPage = ReservasPage;
