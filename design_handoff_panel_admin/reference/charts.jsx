// Small chart components: Sparkline, AreaChart, HourHeatmap.

const Sparkline = ({ data, color = "var(--terracotta-500)", fill = "var(--terracotta-100)", height = 28, width = 90 }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const linePath = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaPath = linePath + ` L${width},${height} L0,${height} Z`;
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={areaPath} fill={fill} opacity="0.5" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
};

const AreaChart = ({ series, labels, height = 240, colors }) => {
  // series: [{ name, data: number[] }]
  const n = series[0]?.data.length || 0;
  const all = series.flatMap(s => s.data);
  const max = Math.max(...all, 1);
  const W = 800, H = height;
  const padL = 40, padR = 10, padT = 18, padB = 32;
  const cw = W - padL - padR;
  const ch = H - padT - padB;
  const stepX = cw / Math.max(n - 1, 1);

  const yTicks = 4;
  const tickVals = Array.from({length: yTicks + 1}, (_, i) => max * (i / yTicks));

  const build = (data) => {
    const pts = data.map((v, i) => [padL + i * stepX, padT + ch - (v / max) * ch]);
    return {
      line: pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" "),
      area: pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ")
            + ` L${padL + (n-1)*stepX},${padT+ch} L${padL},${padT+ch} Z`,
      pts
    };
  };

  const [hover, setHover] = React.useState(null);
  const svgRef = React.useRef(null);
  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    const i = Math.round((x - padL) / stepX);
    if (i >= 0 && i < n) setHover(i);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}
           onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
        <defs>
          {series.map((s, idx) => (
            <linearGradient key={idx} id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors[idx]} stopOpacity="0.35"/>
              <stop offset="100%" stopColor={colors[idx]} stopOpacity="0"/>
            </linearGradient>
          ))}
        </defs>
        {/* y grid */}
        {tickVals.map((v, i) => {
          const y = padT + ch - (v / max) * ch;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="var(--border)" strokeDasharray="3 4"/>
              <text x={padL - 8} y={y + 4} fontSize="10.5" fill="var(--ink-500)" textAnchor="end" fontFamily="var(--font-sans)">
                ${v >= 1000 ? (v/1000).toFixed(1) + "k" : Math.round(v)}
              </text>
            </g>
          );
        })}
        {/* x labels */}
        {labels.map((l, i) => {
          const every = Math.ceil(labels.length / 8);
          if (i % every !== 0 && i !== labels.length - 1) return null;
          const x = padL + i * stepX;
          return (
            <text key={i} x={x} y={H - 10} fontSize="10.5" fill="var(--ink-500)" textAnchor="middle" fontFamily="var(--font-sans)">
              {l}
            </text>
          );
        })}
        {/* series */}
        {series.map((s, idx) => {
          const b = build(s.data);
          return (
            <g key={idx}>
              <path d={b.area} fill={`url(#grad-${idx})`} />
              <path d={b.line} fill="none" stroke={colors[idx]} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
              {hover !== null && (
                <circle cx={b.pts[hover][0]} cy={b.pts[hover][1]} r="4"
                        fill="var(--surface)" stroke={colors[idx]} strokeWidth="2"/>
              )}
            </g>
          );
        })}
        {/* hover line */}
        {hover !== null && (
          <line x1={padL + hover * stepX} x2={padL + hover * stepX}
                y1={padT} y2={padT + ch}
                stroke="var(--ink-400)" strokeDasharray="2 3" strokeWidth="1"/>
        )}
      </svg>
      {hover !== null && (
        <div style={{
          position: "absolute",
          left: `calc(${((padL + hover * stepX) / W) * 100}% + 8px)`,
          top: 12,
          background: "var(--ink-900)",
          color: "var(--cream-50)",
          padding: "8px 12px",
          borderRadius: 8,
          fontSize: 12,
          pointerEvents: "none",
          boxShadow: "var(--shadow-md)",
          whiteSpace: "nowrap",
          transform: "translateX(0)",
        }}>
          <div style={{ opacity: 0.7, fontSize: 11, marginBottom: 2 }}>{labels[hover]}</div>
          {series.map((s, idx) => (
            <div key={idx} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: colors[idx], display: "inline-block" }}/>
              <span>{s.name}: <b>${s.data[hover].toLocaleString("es-MX")}</b></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Hour heatmap: 7 days x 24h
const HourHeatmap = ({ data }) => {
  // data: number[7][24]
  const max = Math.max(...data.flat(), 1);
  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "grid", gridTemplateColumns: "18px repeat(24, 1fr)", gap: 3, alignItems: "center" }}>
        <div/>
        {hours.map(h => (
          <div key={h} style={{ fontSize: 9.5, color: "var(--ink-400)", textAlign: "center" }}>
            {h % 3 === 0 ? h : ""}
          </div>
        ))}
        {days.map((d, row) => (
          <React.Fragment key={d}>
            <div style={{ fontSize: 10.5, color: "var(--ink-500)", fontWeight: 600 }}>{d}</div>
            {hours.map(h => {
              const v = data[row][h] / max;
              const opacity = 0.08 + v * 0.92;
              return (
                <div key={h}
                     title={`${d} ${h}:00 — ${data[row][h]} pedidos`}
                     style={{
                       aspectRatio: "1",
                       background: `color-mix(in oklch, var(--terracotta-500) ${v * 100}%, var(--cream-100))`,
                       borderRadius: 3,
                       opacity: data[row][h] === 0 ? 0.3 : 1,
                     }}/>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "var(--ink-500)" }}>
        <span>Menos</span>
        <div style={{ display: "flex", gap: 3 }}>
          {[0.1, 0.25, 0.5, 0.75, 1].map((o, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: 3,
              background: `color-mix(in oklch, var(--terracotta-500) ${o*100}%, var(--cream-100))` }}/>
          ))}
        </div>
        <span>Más</span>
      </div>
    </div>
  );
};

// Donut/ring for revenue split
const Donut = ({ segments, size = 140, thickness = 22 }) => {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--cream-100)" strokeWidth={thickness}/>
      {segments.map((s, i) => {
        const len = (s.value / total) * C;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r}
                  fill="none" stroke={s.color}
                  strokeWidth={thickness}
                  strokeDasharray={`${len} ${C - len}`}
                  strokeDashoffset={-offset}
                  transform={`rotate(-90 ${size/2} ${size/2})`}
                  strokeLinecap="butt"/>
        );
        offset += len;
        return el;
      })}
      <text x={size/2} y={size/2 - 4} textAnchor="middle"
            fontFamily="var(--font-serif)" fontWeight="500" fontSize="26" fill="var(--ink-900)">
        {total}
      </text>
      <text x={size/2} y={size/2 + 14} textAnchor="middle"
            fontSize="11" fill="var(--ink-500)" letterSpacing="0.05em">
        PEDIDOS HOY
      </text>
    </svg>
  );
};

Object.assign(window, { Sparkline, AreaChart, HourHeatmap, Donut });
