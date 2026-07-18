// Mesas module — floor plan with real-time table management

const { useState: useS1, useMemo: useM1 } = React;

const MesasStats = () => {
  const occ = MESAS_DATA.filter(m => m.status === "occupied").length;
  const res = MESAS_DATA.filter(m => m.status === "reserved").length;
  const free = MESAS_DATA.filter(m => m.status === "free").length;
  const clean = MESAS_DATA.filter(m => m.status === "cleaning").length;
  const occPct = Math.round((occ / MESAS_DATA.length) * 100);
  const items = [
    { label: "Ocupación", value: `${occPct}%`, sub: `${occ} de ${MESAS_DATA.length} mesas`, bg: "var(--terracotta-50)", color: "var(--terracotta-500)", ico: IconTable },
    { label: "Libres",    value: free, sub: "Listas para clientes",        bg: "var(--sage-100)", color: "var(--sage-500)", ico: IconCheck },
    { label: "Reservas",  value: res,  sub: "Próximas en las siguientes 2h", bg: "var(--saffron-100)", color: "var(--saffron-500)", ico: IconCalendar },
    { label: "En limpieza", value: clean, sub: "Esperando disponibilidad", bg: "var(--sky-100)", color: "var(--sky-500)", ico: IconClock },
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

const FloorTable = ({ mesa, selected, onClick }) => {
  const size = mesa.cap <= 2 ? 62 : mesa.cap <= 4 ? 78 : mesa.cap <= 6 ? 90 : 108;
  return (
    <div className={`floor-table ${mesa.shape} ${mesa.status} ${selected ? "selected" : ""}`}
         style={{ left: mesa.x, top: mesa.y, width: size, height: mesa.shape === "round" ? size : size * 0.75 }}
         onClick={onClick}>
      <div className="t-num">{String(mesa.n).padStart(2, "0")}</div>
      <div className="t-cap">{mesa.cap} pax</div>
    </div>
  );
};

const MesaDetail = ({ mesa, onStatus }) => {
  if (!mesa) {
    return (
      <div className="table-detail" style={{ textAlign: "center", padding: 32 }}>
        <IconTable size={32} style={{ color: "var(--ink-300)", margin: "0 auto 10px", display: "block" }}/>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 18, color: "var(--ink-700)", marginBottom: 4 }}>Selecciona una mesa</div>
        <div style={{ fontSize: 12.5, color: "var(--ink-500)" }}>Haz clic en cualquier mesa del plano para ver detalles y cambiar su estado</div>
      </div>
    );
  }
  const statusMap = {
    free: { label: "Libre", ico: IconCheck },
    occupied: { label: "Ocupada", ico: IconUsers },
    reserved: { label: "Reservada", ico: IconCalendar },
    cleaning: { label: "Limpieza", ico: IconClock },
  };
  return (
    <div className="table-detail">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-500)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Mesa</div>
          <div className="td-big serif">{String(mesa.n).padStart(2, "0")}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Capacidad</div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 500 }}>{mesa.cap} pax</div>
        </div>
      </div>

      <div className="td-row"><span className="k">Zona</span>
        <span className="v" style={{ textTransform: "capitalize" }}>{mesa.zone}</span></div>
      <div className="td-row"><span className="k">Forma</span>
        <span className="v">{mesa.shape === "round" ? "Redonda" : "Cuadrada"}</span></div>
      {mesa.status === "occupied" && (
        <>
          <div className="td-row"><span className="k">Comensales</span><span className="v">{mesa.guests} personas</span></div>
          <div className="td-row"><span className="k">Tiempo</span><span className="v tnum">{mesa.time}</span></div>
          <div className="td-row"><span className="k">Ticket actual</span><span className="v tnum">${mesa.ticket}</span></div>
          <div className="td-row"><span className="k">Mesero</span><span className="v">{mesa.server}</span></div>
          <div className="td-row"><span className="k">Apertura</span><span className="v tnum">{mesa.orderStart}</span></div>
        </>
      )}
      {mesa.status === "reserved" && (
        <>
          <div className="td-row"><span className="k">Titular</span><span className="v">{mesa.holder}</span></div>
          <div className="td-row"><span className="k">Hora</span><span className="v tnum">{mesa.time}</span></div>
          <div className="td-row"><span className="k">Personas</span><span className="v">{mesa.guests}</span></div>
        </>
      )}

      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, color: "var(--ink-500)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>Cambiar estado</div>
        <div className="status-select">
          {Object.entries(statusMap).map(([k, v]) => {
            const Ico = v.ico;
            return (
              <button key={k} className={`status-btn ${mesa.status === k ? "active" : ""}`}
                      onClick={() => onStatus(mesa.n, k)}>
                <Ico size={13}/> {v.label}
              </button>
            );
          })}
        </div>
      </div>

      {mesa.status === "occupied" && (
        <button className="btn btn-accent" style={{ width: "100%", marginTop: 10, justifyContent: "center" }}>
          <IconReceipt size={14}/> Ver pedido
        </button>
      )}
    </div>
  );
};

const MesasPage = () => {
  const [mesas, setMesas] = useS1(MESAS_DATA);
  const [selected, setSelected] = useS1(null);

  const zonas = useM1(() => {
    const groups = {};
    mesas.forEach(m => { (groups[m.zone] ||= []).push(m); });
    return groups;
  }, [mesas]);

  const current = mesas.find(m => m.n === selected);
  const changeStatus = (n, s) => {
    setMesas(prev => prev.map(m => m.n === n ? { ...m, status: s } : m));
  };

  return (
    <>
      <div className="mod-head">
        <div>
          <h2 className="serif">Gestión de Mesas</h2>
          <div className="mod-sub">Plano interactivo en tiempo real · Salón, Terraza y Privado</div>
        </div>
        <div className="mod-head-actions">
          <button className="btn"><IconPlus size={15}/> Nueva mesa</button>
          <button className="btn"><IconSettings size={15}/> Editar layout</button>
          <button className="btn btn-accent"><IconCalendar size={15}/> Reservación</button>
        </div>
      </div>

      <MesasStats/>

      <div className="floor-wrap">
        <div className="floor-canvas">
          {/* Zonas */}
          <div className="floor-zone" style={{ left: 50, top: 30, width: 530, height: 280 }}>
            <span className="zone-label">Salón principal</span>
          </div>
          <div className="floor-zone" style={{ left: 50, top: 330, width: 530, height: 150 }}>
            <span className="zone-label">Terraza</span>
          </div>
          <div className="floor-zone" style={{ left: 600, top: 130, width: 140, height: 160 }}>
            <span className="zone-label">Privado</span>
          </div>
          {mesas.map(m => (
            <FloorTable key={m.n} mesa={m} selected={selected === m.n}
                        onClick={() => setSelected(m.n)}/>
          ))}
        </div>

        <div className="floor-side">
          <MesaDetail mesa={current} onStatus={changeStatus}/>
          <div className="floor-legend">
            <div className="legend-title">Leyenda</div>
            <div className="legend-row">
              <span className="l"><span className="legend-swatch" style={{ background: "var(--surface)", borderColor: "var(--ink-200)" }}/> Libre</span>
              <span style={{ color: "var(--ink-500)", fontSize: 12 }}>{mesas.filter(m=>m.status==="free").length}</span>
            </div>
            <div className="legend-row">
              <span className="l"><span className="legend-swatch" style={{ background: "var(--terracotta-50)", borderColor: "var(--terracotta-500)" }}/> Ocupada</span>
              <span style={{ color: "var(--ink-500)", fontSize: 12 }}>{mesas.filter(m=>m.status==="occupied").length}</span>
            </div>
            <div className="legend-row">
              <span className="l"><span className="legend-swatch" style={{ background: "var(--saffron-100)", borderColor: "var(--saffron-500)" }}/> Reservada</span>
              <span style={{ color: "var(--ink-500)", fontSize: 12 }}>{mesas.filter(m=>m.status==="reserved").length}</span>
            </div>
            <div className="legend-row">
              <span className="l"><span className="legend-swatch" style={{ background: "var(--sky-100)", borderColor: "var(--sky-500)" }}/> Limpieza</span>
              <span style={{ color: "var(--ink-500)", fontSize: 12 }}>{mesas.filter(m=>m.status==="cleaning").length}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

window.MesasPage = MesasPage;
