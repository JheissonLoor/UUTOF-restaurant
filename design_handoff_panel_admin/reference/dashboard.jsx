// Mesa & Sabor — Panel de Administración
// Main dashboard view

const { useState, useEffect, useRef, useMemo } = React;

// ================= Topbar =================
const Topbar = () => (
  <header className="topbar">
    <div className="brand">
      <div className="brand-mark">
        <span style={{ fontFamily: "var(--font-serif)", fontWeight: 700, fontSize: 16, letterSpacing: "0.02em" }}>U</span>
      </div>
      <span className="serif">UTTOF</span>
    </div>
    <div className="role-pill">
      <IconSettings size={13}/>
      Administración
    </div>
    <div className="spacer"/>
    <div className="topbar-actions">
      <button className="icon-btn" title="Buscar"><IconSearch size={18}/></button>
      <button className="icon-btn" title="Notificaciones">
        <IconBell size={18}/>
        <span className="dot"/>
      </button>
      <button className="user-chip">
        <div className="avatar">R</div>
        <div>
          <div className="name">Roberto</div>
          <div className="role-sub">Gerente general</div>
        </div>
      </button>
      <button className="icon-btn" title="Cerrar sesión"><IconLogOut size={18}/></button>
    </div>
  </header>
);

// ================= Tabs =================
const TABS = [
  { id: "dashboard", label: "Dashboard", icon: IconDashboard, count: null },
  { id: "menu",      label: "Menú",      icon: IconMenu,      count: 15 },
  { id: "mesas",     label: "Mesas",     icon: IconTable,     count: 12 },
  { id: "reservas",  label: "Reservas",  icon: IconCalendar,  count: 8 },
  { id: "empleados", label: "Usuarios",  icon: IconUsers,     count: 12 },
  { id: "reportes",  label: "Reportes",  icon: IconTrendUp,   count: null },
  { id: "config",    label: "Config.",   icon: IconSettings,  count: null },
];

const TabNav = ({ active, onChange }) => {
  const tabRefs = useRef({});
  const [underline, setUnderline] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const el = tabRefs.current[active];
    if (el) setUnderline({ left: el.offsetLeft, width: el.offsetWidth });
  }, [active]);

  return (
    <div className="tabs">
      {TABS.map(t => {
        const Ico = t.icon;
        return (
          <button
            key={t.id}
            ref={el => tabRefs.current[t.id] = el}
            className={`tab ${active === t.id ? "active" : ""}`}
            onClick={() => onChange(t.id)}
          >
            <Ico size={16}/>
            {t.label}
            {t.count !== null && <span className="count">{t.count}</span>}
          </button>
        );
      })}
      <div className="tab-underline" style={{ left: underline.left, width: underline.width }}/>
    </div>
  );
};

// ================= Stat Cards =================
const StatCard = ({ label, value, unit, icon: Ico, iconVariant, delta, deltaLabel, spark, sparkColor, sparkFill }) => (
  <div className="stat">
    <div className="stat-head">
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">
          {unit === "$" && <span className="unit">$</span>}
          <span>{value}</span>
          {unit && unit !== "$" && <span className="unit">{unit}</span>}
        </div>
      </div>
      <div className={`stat-icon ${iconVariant}`}>
        <Ico size={18} strokeWidth={1.8}/>
      </div>
    </div>
    <div className="stat-foot">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {delta !== undefined && (
          <span className={`delta ${delta > 0 ? "up" : delta < 0 ? "down" : "flat"}`}>
            {delta > 0 ? <IconArrowUp size={11}/> : delta < 0 ? <IconArrowDown size={11}/> : null}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        {deltaLabel && <span style={{ fontSize: 12, color: "var(--ink-500)" }}>{deltaLabel}</span>}
      </div>
      {spark && <Sparkline data={spark} color={sparkColor} fill={sparkFill}/>}
    </div>
  </div>
);

const StatCards = () => {
  const d = DATA.today;
  const ingresosDelta = ((d.ingresos - d.ingresosAyer) / d.ingresosAyer) * 100;
  const pedidosDelta = ((d.pedidos - d.pedidosAyer) / d.pedidosAyer) * 100;
  const ticketDelta = ((d.ticketPromedio - d.ticketPromedioAyer) / d.ticketPromedioAyer) * 100;
  const mesasPct = (d.mesasOcupadas / d.mesasTotales) * 100;

  const s1 = useMemo(() => makeSpark(1.2, 1.2), []);
  const s2 = useMemo(() => makeSpark(2.5, 1), []);
  const s3 = useMemo(() => makeSpark(3.1, 0.8), []);
  const s4 = useMemo(() => makeSpark(4.0, 1.1), []);

  return (
    <div className="grid grid-4">
      <StatCard
        label="Ingresos hoy" value={fmt$(d.ingresos)} unit="$"
        icon={IconDollar} iconVariant="green"
        delta={ingresosDelta} deltaLabel="vs. ayer"
        spark={s1} sparkColor="var(--sage-500)" sparkFill="var(--sage-100)"
      />
      <StatCard
        label="Pedidos totales" value={d.pedidos}
        icon={IconReceipt} iconVariant="blue"
        delta={pedidosDelta} deltaLabel="vs. ayer"
        spark={s2} sparkColor="var(--sky-500)" sparkFill="var(--sky-100)"
      />
      <StatCard
        label="Mesas ocupadas" value={`${d.mesasOcupadas}/${d.mesasTotales}`}
        icon={IconTable} iconVariant="terracotta"
        delta={undefined}
        deltaLabel={`${mesasPct.toFixed(0)}% ocupación`}
        spark={s3} sparkColor="var(--terracotta-500)" sparkFill="var(--terracotta-100)"
      />
      <StatCard
        label="Ticket promedio" value={fmt$(d.ticketPromedio)} unit="$"
        icon={IconTrendUp} iconVariant="saffron"
        delta={ticketDelta} deltaLabel="vs. ayer"
        spark={s4} sparkColor="var(--saffron-500)" sparkFill="var(--saffron-100)"
      />
    </div>
  );
};

// ================= Revenue Chart =================
const RevenueChart = () => {
  const r = DATA.revenue14;
  const total = r.thisWeek.reduce((a, b) => a + b, 0);
  return (
    <div className="card">
      <div className="card-head">
        <div>
          <h3>Ingresos · últimos 14 días</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 10 }}>
            <div className="revenue-hero">
              <span className="currency serif">$</span>
              <span className="big serif">{fmt$(total)}</span>
            </div>
            <span className="delta up"><IconArrowUp size={11}/>12.4%</span>
            <span style={{ fontSize: 12.5, color: "var(--ink-500)" }}>vs. período anterior</span>
          </div>
        </div>
        <div className="revenue-legend">
          <span><span className="legend-dot" style={{ background: "var(--terracotta-500)" }}/>Esta semana</span>
          <span><span className="legend-dot" style={{ background: "var(--ink-300)" }}/>Anterior</span>
        </div>
      </div>
      <AreaChart
        series={[
          { name: "Esta semana", data: r.thisWeek },
          { name: "Semana anterior", data: r.lastWeek },
        ]}
        labels={r.labels}
        colors={["var(--terracotta-500)", "var(--ink-300)"]}
        height={220}
      />
    </div>
  );
};

// ================= Pedidos distribution (donut + bars) =================
const PedidosDistribucion = () => {
  const d = DATA.distribucion;
  const total = d.reduce((a, s) => a + s.count, 0);
  const donutSegments = d.filter(s => s.count > 0).map(s => ({
    value: s.count, color: s.color
  }));
  return (
    <div className="card">
      <div className="card-head">
        <h3>Distribución de Pedidos</h3>
        <span className="meta">hoy</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, alignItems: "center" }}>
        <Donut segments={donutSegments} size={140} thickness={20}/>
        <div>
          {d.map(s => {
            const pct = (s.count / total) * 100;
            return (
              <div key={s.key} className="bar-row">
                <div className="bar-label">
                  <span className="status-dot" style={{ background: s.color }}/>
                  {s.label}
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${pct}%`, background: s.color }}/>
                </div>
                <div className="bar-count tnum">{s.count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ================= Mapa de Mesas =================
const MESA_STATUS = {
  occupied: { label: "Ocupada", className: "occupied" },
  free:     { label: "Libre",   className: "" },
  reserved: { label: "Reserva", className: "reserved" },
  cleaning: { label: "Limpieza", className: "cleaning" },
};

const MesasMap = () => {
  const stats = {
    occupied: DATA.mesas.filter(m => m.status === "occupied").length,
    free:     DATA.mesas.filter(m => m.status === "free").length,
    reserved: DATA.mesas.filter(m => m.status === "reserved").length,
    cleaning: DATA.mesas.filter(m => m.status === "cleaning").length,
  };
  return (
    <div className="card">
      <div className="card-head">
        <h3>Mesas en Tiempo Real</h3>
        <div style={{ display: "flex", gap: 10, fontSize: 12, color: "var(--ink-500)" }}>
          <span><span className="status-dot" style={{ background: "var(--terracotta-500)", display: "inline-block", marginRight: 5, verticalAlign: "middle" }}/>{stats.occupied} ocupadas</span>
          <span><span className="status-dot" style={{ background: "var(--saffron-500)", display: "inline-block", marginRight: 5, verticalAlign: "middle" }}/>{stats.reserved} reservas</span>
        </div>
      </div>
      <div className="table-grid">
        {DATA.mesas.map(m => {
          const cfg = MESA_STATUS[m.status];
          return (
            <div key={m.n} className={`mesa ${cfg.className}`}>
              {m.time && <div className="timer">{m.time}</div>}
              <div className="num serif">{String(m.n).padStart(2, "0")}</div>
              <div>
                <div className="status">{cfg.label}</div>
                {m.guests && (
                  <div className="guests">
                    <IconUsers size={10}/> {m.guests} · ${m.ticket || "—"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================= Actividad =================
const FEED_CFG = {
  order:   { bg: "var(--terracotta-50)", color: "var(--terracotta-500)", icon: IconReceipt },
  pay:     { bg: "var(--sage-100)",      color: "var(--sage-500)",       icon: IconDollar },
  ready:   { bg: "var(--sky-100)",       color: "var(--sky-500)",        icon: IconCheck },
  reserve: { bg: "var(--saffron-100)",   color: "var(--saffron-500)",    icon: IconCalendar },
  review:  { bg: "var(--wine-100)",      color: "var(--wine-500)",       icon: IconStar },
};

const ActivityFeed = () => (
  <div className="card">
    <div className="card-head">
      <h3>Actividad Reciente</h3>
      <span className="meta">en vivo</span>
    </div>
    <div>
      {DATA.actividad.map((a, i) => {
        const cfg = FEED_CFG[a.type];
        const Ico = cfg.icon;
        return (
          <div key={i} className="feed-item">
            <div className="feed-icon" style={{ background: cfg.bg, color: cfg.color }}>
              <Ico size={15}/>
            </div>
            <div className="feed-body">
              <div className="feed-title"><b>{a.who}</b> — {a.what}</div>
              <div className="feed-meta">
                <span>{a.when}</span>
                <span className="sep">·</span>
                <span>{a.actor}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

// ================= Top platillos =================
const TopPlatillos = () => (
  <div className="card">
    <div className="card-head">
      <h3>Top Platillos · hoy</h3>
      <button className="btn" style={{ padding: "5px 10px", fontSize: 12 }}>Ver todo</button>
    </div>
    <div>
      {DATA.topPlatillos.map((p, i) => (
        <div key={p.name} className="dish-row">
          <div className={`dish-rank serif ${i === 0 ? "top" : ""}`}>
            {i === 0 ? <IconFlame size={16} strokeWidth={2} style={{ color: "var(--terracotta-500)" }}/> : String(i + 1).padStart(2, "0")}
          </div>
          <div>
            <div className="dish-name">{p.name}</div>
            <div className="dish-sub">{p.cat}</div>
            <div className="dish-bar">
              <div className="dish-bar-fill" style={{ width: `${p.pct * 100}%` }}/>
            </div>
          </div>
          <div className="dish-count tnum">{p.count}</div>
        </div>
      ))}
    </div>
  </div>
);

// ================= Alertas =================
const Alertas = () => (
  <div className="card">
    <div className="card-head">
      <h3>Requiere atención</h3>
      <span className="meta">{DATA.alertas.length} alertas</span>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {DATA.alertas.map((a, i) => (
        <div key={i} className={`alert ${a.level}`}>
          <div className="alert-icon">
            <IconAlertTriangle size={14} strokeWidth={2}/>
          </div>
          <div className="alert-body">
            <div className="alert-title">{a.title}</div>
            <div className="alert-sub">{a.sub}</div>
          </div>
          <button className="alert-action">Resolver</button>
        </div>
      ))}
    </div>
  </div>
);

// ================= Métodos de Pago =================
const PAY_ICONS = {
  "Pagos Online":      IconCreditCard,
  "Pagos en Efectivo": IconCash,
  "Reservaciones":     IconCalendar,
};

const MetodosPago = () => {
  const total = DATA.pagos.reduce((a, p) => a + p.amount, 0);
  return (
    <div className="card">
      <div className="card-head">
        <h3>Métodos de Pago</h3>
        <span className="meta tnum">${fmt$(total)} total</span>
      </div>
      <div>
        {DATA.pagos.map(p => {
          const Ico = PAY_ICONS[p.name];
          return (
            <div key={p.name} className="pay-row">
              <div className="pay-left">
                <div className="pay-icon" style={{ background: p.bg, color: p.color }}>
                  <Ico size={17}/>
                </div>
                <div>
                  <div className="pay-name">{p.name}</div>
                  <div className="pay-sub">{p.sub}</div>
                </div>
              </div>
              <div className="pay-right">
                <div className="pay-amount tnum">${fmt$(p.amount)}</div>
                <div className="pay-pct">{p.pct}% del total</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ================= Heatmap =================
const HorasPico = () => (
  <div className="card">
    <div className="card-head">
      <h3>Horas Pico · últimos 7 días</h3>
      <span className="meta">pedidos por hora</span>
    </div>
    <HourHeatmap data={DATA.heatmap}/>
  </div>
);

// ================= Dashboard =================
const Dashboard = () => (
  <>
    <StatCards/>
    <div style={{ height: 16 }}/>
    <div className="grid grid-revenue">
      <RevenueChart/>
      <PedidosDistribucion/>
    </div>
    <div style={{ height: 16 }}/>
    <MesasMap/>
    <div style={{ height: 16 }}/>
    <div className="grid grid-bottom">
      <ActivityFeed/>
      <TopPlatillos/>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Alertas/>
        <MetodosPago/>
      </div>
    </div>
    <div style={{ height: 16 }}/>
    <HorasPico/>
  </>
);

// ================= Placeholder tabs =================
const Placeholder = ({ title, desc }) => (
  <div style={{
    background: "var(--surface)",
    border: "1px dashed var(--border-strong)",
    borderRadius: "var(--r-lg)",
    padding: 80,
    textAlign: "center",
  }}>
    <div className="serif" style={{ fontSize: 28, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 8 }}>{title}</div>
    <div style={{ color: "var(--ink-500)", fontSize: 14 }}>{desc}</div>
  </div>
);

Object.assign(window, {
  Topbar, TabNav, TABS, Dashboard, Placeholder,
});
