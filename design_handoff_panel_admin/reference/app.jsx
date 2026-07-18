// Tweaks panel — accent color, density, font pair, dark mode

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "coral",
  "density": "normal",
  "fontPair": "editorial",
  "dark": false,
  "variant": "default"
}/*EDITMODE-END*/;

const ACCENTS = [
  { id: "coral",      label: "Coral",     color: "#E94B33" },
  { id: "paprika",    label: "Páprika",   color: "#CC4A1C" },
  { id: "mint",       label: "Menta",     color: "#4FA88E" },
  { id: "saffron",    label: "Azafrán",   color: "#C98824" },
  { id: "wine",       label: "Vino",      color: "#9C2A17" },
];

const DENSITIES = [
  { id: "compact", label: "Compacto" },
  { id: "normal",  label: "Normal" },
  { id: "cozy",    label: "Amplio" },
];

const FONT_PAIRS = [
  { id: "editorial", label: "Editorial", serif: "Fraunces", sans: "Inter" },
  { id: "modern",    label: "Moderno",   serif: "Cormorant Garamond", sans: "Inter" },
  { id: "clean",     label: "Limpio",    serif: "Inter",    sans: "Inter" },
];

const TweaksPanel = ({ open, onClose, tweaks, setTweaks }) => {
  const update = (patch) => {
    const next = { ...tweaks, ...patch };
    setTweaks(next);
    try {
      window.parent.postMessage({ type: "__edit_mode_set_keys", edits: patch }, "*");
    } catch (e) {}
  };

  return (
    <div className={`tweaks-panel ${open ? "open" : ""}`}>
      <div className="tweaks-head">
        <h4>Tweaks</h4>
        <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={onClose}>
          <IconX size={15}/>
        </button>
      </div>

      <div className="tweak-group">
        <div className="tweak-label">Color de acento</div>
        <div className="swatches">
          {ACCENTS.map(a => (
            <button key={a.id}
                    className={`swatch ${tweaks.accent === a.id ? "active" : ""}`}
                    style={{ background: a.color }}
                    title={a.label}
                    onClick={() => update({ accent: a.id })}/>
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <div className="tweak-label">Densidad</div>
        <div className="seg">
          {DENSITIES.map(d => (
            <button key={d.id}
                    className={tweaks.density === d.id ? "active" : ""}
                    onClick={() => update({ density: d.id })}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <div className="tweak-label">Tipografía</div>
        <div className="seg">
          {FONT_PAIRS.map(f => (
            <button key={f.id}
                    className={tweaks.fontPair === f.id ? "active" : ""}
                    onClick={() => update({ fontPair: f.id })}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tweak-group">
        <div className="tweak-label">Modo</div>
        <div className="seg">
          <button className={!tweaks.dark ? "active" : ""} onClick={() => update({ dark: false })}>Claro</button>
          <button className={tweaks.dark ? "active" : ""} onClick={() => update({ dark: true })}>Oscuro</button>
        </div>
      </div>
    </div>
  );
};

// ================= Root App =================
const App = () => {
  const [active, setActive] = useState(() => localStorage.getItem("ms_active_tab") || "dashboard");
  const [tweaks, setTweaks] = useState(() => {
    const saved = localStorage.getItem("ms_tweaks");
    return saved ? { ...TWEAK_DEFAULTS, ...JSON.parse(saved) } : TWEAK_DEFAULTS;
  });
  const [tweaksOpen, setTweaksOpen] = useState(false);

  useEffect(() => { localStorage.setItem("ms_active_tab", active); }, [active]);
  useEffect(() => { localStorage.setItem("ms_tweaks", JSON.stringify(tweaks)); }, [tweaks]);

  // Apply data attrs for CSS
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-accent", tweaks.accent);
    root.setAttribute("data-density", tweaks.density);
    root.setAttribute("data-theme", tweaks.dark ? "dark" : "light");
    const pair = FONT_PAIRS.find(f => f.id === tweaks.fontPair);
    if (pair) {
      root.style.setProperty("--font-serif", `"${pair.serif}", Georgia, serif`);
      root.style.setProperty("--font-sans",  `"${pair.sans}", -apple-system, sans-serif`);
    }
  }, [tweaks]);

  // Edit-mode protocol
  useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || !e.data.type) return;
      if (e.data.type === "__activate_edit_mode") setTweaksOpen(true);
      if (e.data.type === "__deactivate_edit_mode") setTweaksOpen(false);
    };
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const [range, setRange] = useState("hoy");

  return (
    <div className="app">
      <Topbar/>
      <div className="page">
        <div className="page-head">
          <div>
            <h1 className="serif">Panel de Administración</h1>
            <div className="sub">
              Gestiona tu restaurante desde un solo lugar
              <span className="live"><span className="live-dot"/>En vivo</span>
            </div>
          </div>
          <div className="page-head-actions">
            <div className="range-picker">
              {["hoy", "semana", "mes", "año"].map(r => (
                <button key={r}
                        className={range === r ? "active" : ""}
                        onClick={() => setRange(r)}>
                  {r[0].toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
            <button className="btn">
              <IconDownload size={15}/> Exportar
            </button>
            <button className="btn btn-accent">
              <IconPlus size={15}/> Nuevo pedido
            </button>
          </div>
        </div>

        <TabNav active={active} onChange={setActive}/>

        {active === "dashboard" && <Dashboard/>}
        {active === "menu" && <MenuPage/>}
        {active === "mesas" && <MesasPage/>}
        {active === "reservas" && <ReservasPage/>}
        {active === "empleados" && <EmpleadosPage/>}
        {active === "reportes" && <ReportesPage/>}
        {active === "config" && <ConfigPage/>}
      </div>

      <TweaksPanel open={tweaksOpen} onClose={() => setTweaksOpen(false)}
                   tweaks={tweaks} setTweaks={setTweaks}/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
