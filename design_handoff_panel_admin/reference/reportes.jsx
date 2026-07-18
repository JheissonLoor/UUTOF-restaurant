// Reportes module

const { useState: useSR } = React;

const ReportesStats = () => {
  const r = REPORTES_DATA;
  const delta = ((r.ventasMes - r.ventasMesAnterior) / r.ventasMesAnterior) * 100;
  const ticket = Math.round(r.ventasMes / r.ticketsMes);
  return (
    <div className="rep-hero">
      <div>
        <h3>Ventas del mes · abril 2026</h3>
        <div className="big-num serif">
          <span className="cur">$</span>{fmt$(r.ventasMes)}
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#8ED99A", fontWeight: 600 }}>
            <IconArrowUp size={12}/> {delta.toFixed(1)}%
          </span>
          <span style={{ marginLeft: 10 }}>vs. mes anterior (${fmt$(r.ventasMesAnterior)})</span>
        </div>
        <div className="sub-info">
          <div>
            <div className="lbl">Tickets</div>
            <b>{r.ticketsMes.toLocaleString()}</b>
          </div>
          <div>
            <div className="lbl">Ticket prom.</div>
            <b>${ticket}</b>
          </div>
          <div>
            <div className="lbl">Clientes únicos</div>
            <b>{r.clientesUnicos.toLocaleString()}</b>
          </div>
          <div>
            <div className="lbl">Cancelación</div>
            <b>{r.tasaCancelacion}%</b>
          </div>
        </div>
      </div>
      <div>
        <h3>Exportar reporte</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button className="export-btn" style={{ justifyContent: "flex-start" }}>
            <IconDownload size={14}/> Descargar PDF (reporte ejecutivo)
          </button>
          <button className="export-btn" style={{ justifyContent: "flex-start" }}>
            <IconDownload size={14}/> Descargar Excel (detalle completo)
          </button>
          <button className="export-btn" style={{ justifyContent: "flex-start" }}>
            <IconCalendar size={14}/> Programar envío semanal por email
          </button>
        </div>
      </div>
    </div>
  );
};

const VentasDiarias = () => {
  const r = REPORTES_DATA;
  const labels = Array.from({ length: 30 }, (_, i) => String(i + 1));
  return (
    <div className="card">
      <div className="card-head">
        <h3>Ventas diarias · últimos 30 días</h3>
        <span className="meta">$ MXN por día</span>
      </div>
      <AreaChart
        series={[{ name: "Ventas", data: r.ventasDia }]}
        labels={labels}
        colors={["var(--terracotta-500)"]}
        height={240}
      />
    </div>
  );
};

const RankingProductos = () => {
  const r = REPORTES_DATA.topProductosMes;
  const max = Math.max(...r.map(p => p.sold));
  return (
    <div className="card">
      <div className="card-head">
        <h3>Productos más pedidos</h3>
        <span className="meta">abril 2026</span>
      </div>
      <div>
        {r.map((p, i) => (
          <div key={p.name} className="rank-row">
            <div className={`rank-num ${i < 3 ? `top-${i+1}` : ""}`}>{String(i+1).padStart(2, "0")}</div>
            <div>
              <div className="rank-name">{p.name}</div>
              <div className="rank-sub">
                <span>{p.cat}</span>
                <span style={{ color: "var(--ink-300)" }}>·</span>
                <span>${fmt$(p.rev)} generados</span>
              </div>
              <div className="rank-bar">
                <div className="rank-bar-fill" style={{ width: `${(p.sold/max)*100}%` }}/>
              </div>
            </div>
            <div className="rank-val tnum">{p.sold}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const IngresosPorPago = () => {
  const r = REPORTES_DATA.ingresosPorPago;
  const total = r.reduce((a, x) => a + x.amount, 0);
  return (
    <div className="card">
      <div className="card-head">
        <h3>Ingresos por método de pago</h3>
        <span className="meta tnum">${fmt$(total)} total</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 20, alignItems: "center" }}>
        <Donut
          segments={r.map(x => ({ value: x.amount, color: x.color }))}
          size={140} thickness={22}
        />
        <div>
          {r.map(x => (
            <div key={x.method} className="pay-row">
              <div className="pay-left">
                <span className="status-dot" style={{ background: x.color, width: 10, height: 10 }}/>
                <div>
                  <div className="pay-name">{x.method}</div>
                  <div className="pay-sub">{x.pct.toFixed(1)}% del total</div>
                </div>
              </div>
              <div className="pay-right">
                <div className="pay-amount tnum">${fmt$(x.amount)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Cancelaciones = () => {
  const c = REPORTES_DATA.cancelacion;
  const max = Math.max(...c.porMotivo.map(m => m.count));
  return (
    <div className="card">
      <div className="card-head">
        <h3>Cancelaciones por motivo</h3>
        <span className="meta">{c.total} totales · {REPORTES_DATA.tasaCancelacion}% tasa</span>
      </div>
      <div>
        {c.porMotivo.map(m => (
          <div key={m.reason} className="bar-row">
            <div className="bar-label">
              <span className="status-dot" style={{ background: m.color }}/>
              {m.reason}
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${(m.count/max)*100}%`, background: m.color }}/>
            </div>
            <div className="bar-count tnum">{m.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReportesPage = () => {
  const [range, setRange] = useSR("mes");
  return (
    <>
      <div className="mod-head">
        <div>
          <h2 className="serif">Reportes y Estadísticas</h2>
          <div className="mod-sub">Analiza el desempeño de tu restaurante y exporta informes</div>
        </div>
        <div className="mod-head-actions">
          <div className="range-picker">
            {["semana", "mes", "trimestre", "año"].map(r => (
              <button key={r} className={range === r ? "active" : ""} onClick={() => setRange(r)}>
                {r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <button className="btn"><IconCalendar size={15}/> Rango personalizado</button>
        </div>
      </div>

      <ReportesStats/>
      <div style={{ height: 16 }}/>
      <VentasDiarias/>
      <div style={{ height: 16 }}/>
      <div className="grid grid-2">
        <RankingProductos/>
        <IngresosPorPago/>
      </div>
      <div style={{ height: 16 }}/>
      <Cancelaciones/>
    </>
  );
};

window.ReportesPage = ReportesPage;
