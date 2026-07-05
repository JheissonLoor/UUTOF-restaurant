// UTTOF — Cliente (vista del comensal)
// 4 vistas: Inicio, Reservar, Menú, Pedidos

const { useState: useCS, useEffect: useCE, useMemo: useCM, useRef: useCR } = React;

// ================= Icons (cliente) =================
const CIcon = ({ size = 18, strokeWidth = 1.8, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...p}>
    {children}
  </svg>
);
const CHome = (p) => <CIcon {...p}><path d="M3 12l9-9 9 9"/><path d="M5 10v10h14V10"/></CIcon>;
const CCal  = (p) => <CIcon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></CIcon>;
const CMenu = (p) => <CIcon {...p}><path d="M6 3v18M6 8h4a3 3 0 0 0 0-6H6"/><path d="M18 3v18M18 3c-1.7 0-3 3-3 6s1.3 4 3 4"/></CIcon>;
const CBag  = (p) => <CIcon {...p}><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></CIcon>;
const CClock= (p) => <CIcon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></CIcon>;
const CUsers= (p) => <CIcon {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 20c1-4 5-5.5 7-5.5s6 1.5 7 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M22 18c-.5-2.5-2.5-3.5-4-3.5"/></CIcon>;
const CPlus = (p) => <CIcon {...p}><path d="M12 5v14M5 12h14"/></CIcon>;
const CMinus= (p) => <CIcon {...p}><path d="M5 12h14"/></CIcon>;
const CSearch=(p) => <CIcon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></CIcon>;
const CHeart= (p) => <CIcon {...p}><path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23 8.5 21.5 12c-2.5 4.5-9.5 9-9.5 9z"/></CIcon>;
const CHeartFill= (p) => <CIcon {...p} fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3C21 5 23 8.5 21.5 12c-2.5 4.5-9.5 9-9.5 9z"/></CIcon>;
const CArrow= (p) => <CIcon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></CIcon>;
const CClose= (p) => <CIcon {...p}><path d="M6 6l12 12M18 6L6 18"/></CIcon>;
const CCheck= (p) => <CIcon {...p}><path d="m4 12 5 5L20 6"/></CIcon>;
const CSpark= (p) => <CIcon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></CIcon>;
const CFlame= (p) => <CIcon {...p}><path d="M12 22c4 0 7-3 7-7 0-4-4-6-4-10 0 0-3 1-5 5-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z"/></CIcon>;
const CBell = (p) => <CIcon {...p}><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2.5H4.5L6 16z"/><path d="M10 20a2 2 0 0 0 4 0"/></CIcon>;
const CLogout=(p) => <CIcon {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/></CIcon>;
const CCoins= (p) => <CIcon {...p}><ellipse cx="9" cy="8" rx="6" ry="3"/><path d="M3 8v4c0 1.7 2.7 3 6 3s6-1.3 6-3V8"/><path d="M3 12v4c0 1.7 2.7 3 6 3"/><ellipse cx="17" cy="15" rx="4" ry="2"/><path d="M13 15v3c0 1.1 1.8 2 4 2s4-.9 4-2v-3"/></CIcon>;
const CTable= (p) => <CIcon {...p}><path d="M3 10h18M5 10v10M19 10v10M7 10V6h10v4"/></CIcon>;
const CTrend= (p) => <CIcon {...p}><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></CIcon>;
const CRepeat=(p)=>  <CIcon {...p}><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></CIcon>;

// ================= Mock data =================
const C_DISHES = [
  { id: 1, name: "Causa Limeña", cat: "Entradas", price: 24,
    desc: "Papa amarilla prensada con ají, rellena de pollo y palta",
    img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    prep: 8, featured: false, isNew: false },
  { id: 2, name: "Papa a la Huancaína", cat: "Entradas", price: 18,
    desc: "Papa sancochada bañada en crema de ají amarillo y queso fresco",
    img: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=600&q=80",
    prep: 6, featured: false, isNew: false },
  { id: 3, name: "Tiradito de Pescado", cat: "Entradas", price: 32,
    desc: "Finas láminas de pescado en leche de tigre de ají amarillo",
    img: "https://images.unsplash.com/photo-1626509653291-18d9a934b9db?w=600&q=80",
    prep: 10, featured: false, isNew: true },
  { id: 4, name: "Lomo Saltado", cat: "Platos Fuertes", price: 42,
    desc: "Lomo fino salteado al wok con cebolla, tomate, papas fritas y arroz",
    img: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80",
    prep: 18, featured: true, isNew: false },
  { id: 5, name: "Ají de Gallina", cat: "Platos Fuertes", price: 34,
    desc: "Pollo deshilachado en crema de ají amarillo, nueces y pan, con arroz",
    img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80",
    prep: 16, featured: false, isNew: false },
  { id: 6, name: "Arroz con Mariscos", cat: "Platos Fuertes", price: 48,
    desc: "Arroz salteado con mariscos frescos, ají panca y culantro",
    img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&q=80",
    prep: 20, featured: true, isNew: false },
  { id: 7, name: "Suspiro a la Limeña", cat: "Postres", price: 18,
    desc: "Manjar blanco coronado con merengue al oporto y canela",
    img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80",
    prep: 10, featured: true, isNew: false },
  { id: 8, name: "Picarones", cat: "Postres", price: 16,
    desc: "Buñuelos de zapallo y camote bañados en miel de chancaca",
    img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
    prep: 8, featured: false, isNew: false },
  { id: 9, name: "Chicha Morada", cat: "Bebidas", price: 10,
    desc: "Refresco de maíz morado con piña, manzana y especias",
    img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80",
    prep: 3, featured: false, isNew: false },
  { id: 10, name: "Pisco Sour", cat: "Bebidas", price: 24,
    desc: "Cóctel bandera del Perú: pisco, limón, jarabe y clara de huevo",
    img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80",
    prep: 5, featured: false, isNew: false },
  { id: 11, name: "Maracuyá Sour", cat: "Bebidas", price: 26,
    desc: "Versión frutal del clásico con pulpa fresca de maracuyá",
    img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80",
    prep: 5, featured: true, isNew: true },
  { id: 12, name: "Ceviche Clásico", cat: "Platos Fuertes", price: 35,
    desc: "Pescado fresco en leche de tigre, cebolla, camote y choclo",
    img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80",
    prep: 12, featured: false, isNew: false },
];

const C_TIMES = ["12:00","12:30","13:00","13:30","14:00","14:30","15:00","19:00","19:30","20:00","20:30","21:00"];
const C_BUSY_TIMES = new Set(["13:30","14:00","20:00"]);

const C_TABLES = [
  { n: 1,  cap: 2, status: "available", zone: "ventana" },
  { n: 2,  cap: 4, status: "busy",      zone: "salón" },
  { n: 3,  cap: 2, status: "available", zone: "ventana" },
  { n: 4,  cap: 6, status: "reserved",  zone: "salón" },
  { n: 5,  cap: 4, status: "available", zone: "salón" },
  { n: 6,  cap: 8, status: "available", zone: "terraza" },
  { n: 7,  cap: 2, status: "busy",      zone: "barra" },
  { n: 8,  cap: 4, status: "available", zone: "terraza" },
  { n: 9,  cap: 6, status: "available", zone: "salón" },
  { n: 10, cap: 4, status: "reserved",  zone: "ventana" },
  { n: 11, cap: 2, status: "available", zone: "barra" },
  { n: 12, cap: 8, status: "available", zone: "terraza" },
];

const C_ORDERS = [
  {
    id: "UTT-2089", date: "Hoy · 19:42", status: "cooking", step: 2,
    table: "Mesa 5", items: [
      { name: "Lomo Saltado", qty: 1, price: 42 },
      { name: "Pisco Sour", qty: 2, price: 24 },
      { name: "Suspiro a la Limeña", qty: 1, price: 18 },
    ], total: 108,
  },
  {
    id: "UTT-2071", date: "Ayer · 20:18", status: "done", step: 4,
    table: "Mesa 9", items: [
      { name: "Causa Limeña", qty: 2, price: 24 },
      { name: "Arroz con Mariscos", qty: 1, price: 48 },
      { name: "Chicha Morada", qty: 2, price: 10 },
    ], total: 116,
  },
  {
    id: "UTT-2055", date: "Hace 3 días", status: "done", step: 4,
    table: "Mesa 2", items: [
      { name: "Ceviche Clásico", qty: 1, price: 35 },
      { name: "Ají de Gallina", qty: 2, price: 34 },
      { name: "Picarones", qty: 2, price: 16 },
      { name: "Chicha Morada", qty: 2, price: 10 },
    ], total: 155,
  },
];

// ================= Topbar =================
const CTopbar = ({ active, setActive, cartCount, onCart }) => {
  const tabs = [
    { id: "inicio",   label: "Inicio",   ico: CHome },
    { id: "reservar", label: "Reservar", ico: CCal },
    { id: "menu",     label: "Menú",     ico: CMenu },
    { id: "pedidos",  label: "Pedidos",  ico: CBag },
  ];
  return (
    <header className="c-topbar">
      <div className="c-brand">
        <div className="c-brand-mark">U</div>
        <span>UTTOF</span>
      </div>
      <nav className="c-nav">
        {tabs.map(t => {
          const I = t.ico;
          return (
            <button key={t.id} className={active === t.id ? "active" : ""} onClick={() => setActive(t.id)}>
              <I size={15}/> {t.label}
            </button>
          );
        })}
      </nav>
      <div className="c-user">
        <button className="c-icon-btn" title="Notificaciones" onClick={onCart}>
          <CBell size={18}/>
          <span className="dot"/>
        </button>
        <button className="c-user-chip">
          <div className="c-avatar">J</div>
          <span className="name">Juan</span>
        </button>
        <button className="c-icon-btn" title="Cerrar sesión"><CLogout size={18}/></button>
      </div>
    </header>
  );
};

// ================= INICIO =================
const CInicio = ({ setActive, addToCart, favs, toggleFav }) => {
  const greet = useCM(() => {
    const h = new Date().getHours();
    if (h < 12) return "Buenos días";
    if (h < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);
  const featured = C_DISHES.filter(d => d.featured).slice(0, 3);
  return (
    <>
      <section className="c-hero" data-screen-label="01 Inicio - Hero">
        <div className="c-hero-body">
          <span className="c-greet-pill"><span className="pulse"/> {greet}</span>
          <h1>Hola, Juan <span className="wave">👋</span></h1>
          <p>Tu mesa habitual te espera. Reserva, ordena y vive una experiencia hecha a tu medida.</p>
          <div className="c-hero-cta">
            <button className="c-btn-hero" onClick={() => setActive("reservar")}>
              <CCal size={16}/> Reservar mesa
            </button>
            <button className="c-btn-hero ghost" onClick={() => setActive("menu")}>
              <CMenu size={16}/> Ver carta
            </button>
          </div>
        </div>
        <div className="c-hero-deco">
          <div className="c-hero-steam"><span/><span/><span/></div>
          <div className="c-hero-plate"><span className="glyph">U</span></div>
        </div>
      </section>

      <div className="c-stats">
        <div className="c-stat">
          <div className="c-stat-ico coral"><CBag size={22}/></div>
          <div className="c-stat-body">
            <div className="c-stat-val tnum">12</div>
            <div className="c-stat-lbl">Pedidos totales</div>
          </div>
        </div>
        <div className="c-stat">
          <div className="c-stat-ico mint"><CCheck size={22}/></div>
          <div className="c-stat-body">
            <div className="c-stat-val tnum">10</div>
            <div className="c-stat-lbl">Completados</div>
          </div>
        </div>
        <div className="c-stat">
          <div className="c-stat-ico sun"><CCoins size={22}/></div>
          <div className="c-stat-body">
            <div className="c-stat-val tnum"><span className="currency">S/ </span>1,240</div>
            <div className="c-stat-lbl">Total gastado</div>
          </div>
        </div>
        <div className="c-stat">
          <div className="c-stat-ico ink"><CCal size={22}/></div>
          <div className="c-stat-body">
            <div className="c-stat-val tnum">2</div>
            <div className="c-stat-lbl">Reservas activas</div>
          </div>
        </div>
      </div>

      <div className="c-sec-head">
        <div>
          <h2>¿Qué te gustaría hacer hoy?</h2>
          <div className="sub">Acciones rápidas para tu visita</div>
        </div>
      </div>
      <div className="c-quick">
        <button className="c-action" onClick={() => setActive("reservar")}>
          <div className="c-action-ico coral"><CCal size={22}/></div>
          <div>
            <div className="c-action-title">Reservar mesa</div>
            <div className="c-action-sub">Encuentra tu lugar perfecto</div>
          </div>
          <CArrow size={18} className="c-action-arrow"/>
        </button>
        <button className="c-action" onClick={() => setActive("menu")}>
          <div className="c-action-ico mint"><CMenu size={22}/></div>
          <div>
            <div className="c-action-title">Hacer pedido</div>
            <div className="c-action-sub">Explora nuestra carta</div>
          </div>
          <CArrow size={18} className="c-action-arrow"/>
        </button>
        <button className="c-action" onClick={() => setActive("pedidos")}>
          <div className="c-action-ico sun"><CBag size={22}/></div>
          <div>
            <div className="c-action-title">Mis pedidos</div>
            <div className="c-action-sub">Historial y seguimiento</div>
          </div>
          <CArrow size={18} className="c-action-arrow"/>
        </button>
        <button className="c-action">
          <div className="c-action-ico ink"><CUsers size={22}/></div>
          <div>
            <div className="c-action-title">Mi cuenta</div>
            <div className="c-action-sub">Información personal</div>
          </div>
          <CArrow size={18} className="c-action-arrow"/>
        </button>
      </div>

      <div className="c-sec-head">
        <div>
          <h2>Recomendados para ti</h2>
          <div className="sub">Basado en tus pedidos anteriores</div>
        </div>
        <button className="all" onClick={() => setActive("menu")}>
          Ver toda la carta <CArrow size={14}/>
        </button>
      </div>
      <div className="c-rec-grid">
        {featured.map(d => (
          <div key={d.id} className="c-rec" onClick={() => setActive("menu")}>
            <div className="c-rec-img" style={{ backgroundImage: `url(${(window.__resources && window.__resources["dish-" + d.id]) || d.img})` }}>
              <span className="c-rec-tag"><CSpark size={11}/> Recomendado</span>
              <button className={`c-rec-fav ${favs.has(d.id) ? "on" : ""}`}
                      onClick={(e) => { e.stopPropagation(); toggleFav(d.id); }}>
                {favs.has(d.id) ? <CHeartFill size={15}/> : <CHeart size={15}/>}
              </button>
            </div>
            <div className="c-rec-body">
              <h3 className="c-rec-name">{d.name}</h3>
              <p className="c-rec-desc">{d.desc}</p>
              <div className="c-rec-foot">
                <div className="c-rec-price">S/ {d.price}</div>
                <button className="c-rec-add" onClick={(e) => { e.stopPropagation(); addToCart(d); }}>
                  <CPlus size={13}/> Agregar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

// ================= RESERVAR =================
const CReservar = () => {
  const [people, setPeople] = useCS(2);
  const [time, setTime] = useCS("20:00");
  const [zone, setZone] = useCS("todas");
  const [selected, setSelected] = useCS(null);
  const [date, setDate] = useCS("2026-05-02");

  const filtered = zone === "todas" ? C_TABLES : C_TABLES.filter(t => t.zone === zone);

  // If user picked a busy time, show that one as busy + force unselect
  const slotBusy = C_BUSY_TIMES.has(time);

  return (
    <>
      <div className="c-page-head" data-screen-label="02 Reservar">
        <h1>Reservar mesa</h1>
        <div className="sub">Elige fecha, hora y la mesa que prefieras — confirmamos al instante</div>
      </div>
      <div className="c-reservar">
        <div className="c-card">
          <div className="c-field-group">
            <div className="c-field-lbl"><CCal size={14}/> Fecha</div>
            <input type="date" className="c-input" value={date} onChange={e => setDate(e.target.value)}/>
          </div>
          <div className="c-field-group">
            <div className="c-field-lbl"><CUsers size={14}/> Personas</div>
            <div className="c-people">
              <button className="c-people-btn" onClick={() => setPeople(p => Math.max(1, p - 1))}><CMinus size={14}/></button>
              <div style={{ textAlign: "center" }}>
                <div className="c-people-val tnum">{people}</div>
                <div className="c-people-lbl">{people === 1 ? "persona" : "personas"}</div>
              </div>
              <button className="c-people-btn" onClick={() => setPeople(p => Math.min(12, p + 1))}><CPlus size={14}/></button>
            </div>
          </div>
          <div className="c-field-group">
            <div className="c-field-lbl"><CClock size={14}/> Hora</div>
            <div className="c-time-grid">
              {C_TIMES.map(t => {
                const busy = C_BUSY_TIMES.has(t);
                return (
                  <button key={t}
                          className={`c-time ${time === t ? "active" : ""}`}
                          disabled={busy}
                          onClick={() => setTime(t)}>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="c-legend">
            <span className="c-legend-it"><span className="dot" style={{ background: "#5BB39A" }}/>Disponible</span>
            <span className="c-legend-it"><span className="dot" style={{ background: "#E8B14A" }}/>Reservada</span>
            <span className="c-legend-it"><span className="dot" style={{ background: "#E94B33" }}/>Ocupada</span>
          </div>
        </div>

        <div>
          <div className="c-floor">
            <div className="c-floor-head">
              <div className="c-floor-title"><CTable size={18} stroke="#E94B33"/> Salón principal</div>
              <div className="c-floor-zones">
                {["todas","ventana","salón","terraza","barra"].map(z => (
                  <button key={z} className={zone === z ? "active" : ""} onClick={() => setZone(z)}>
                    {z[0].toUpperCase() + z.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="c-tables">
              {filtered.map(t => (
                <button key={t.n}
                        className={`c-table ${t.status} ${selected === t.n ? "selected" : ""}`}
                        disabled={t.status !== "available"}
                        onClick={() => t.status === "available" && setSelected(t.n)}>
                  <span className="c-table-window">{t.zone}</span>
                  <div className="c-table-num">#{t.n}</div>
                  <div className="c-table-meta"><CUsers size={12}/> {t.cap} personas</div>
                  <div className="c-table-status">
                    <span className="dot"/>
                    {t.status === "available" ? "Disponible" : t.status === "busy" ? "Ocupada" : "Reservada"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="c-summary">
            <div className="c-summary-info">
              <div className="c-summary-title">
                {selected ? `Mesa #${selected} reservada` : "Selecciona una mesa para confirmar"}
              </div>
              <div className="c-summary-detail">
                <span><CCal size={13}/> {new Date(date).toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" })}</span>
                <span><CClock size={13}/> {time}{slotBusy ? " (no disponible)" : ""}</span>
                <span><CUsers size={13}/> {people} {people === 1 ? "persona" : "personas"}</span>
              </div>
            </div>
            <button className="c-btn-confirm" disabled={!selected}>
              <CCheck size={15}/> Confirmar reserva
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ================= MENU =================
const CMenuPage = ({ cart, addToCart, removeFromCart, openCart, favs, toggleFav, setActive }) => {
  const cats = ["Todos", "Entradas", "Platos Fuertes", "Postres", "Bebidas"];
  const catIco = { "Entradas": "🥗", "Platos Fuertes": "🍝", "Postres": "🍰", "Bebidas": "🍷", "Todos": "✦" };
  const [cat, setCat] = useCS("Todos");
  const [q, setQ] = useCS("");

  const cartCount = useCM(() => Object.values(cart).reduce((a, b) => a + b, 0), [cart]);

  const filtered = useCM(() => {
    return C_DISHES.filter(d =>
      (cat === "Todos" || d.cat === cat) &&
      (q === "" || d.name.toLowerCase().includes(q.toLowerCase()) || d.desc.toLowerCase().includes(q.toLowerCase()))
    );
  }, [cat, q]);

  const counts = useCM(() => {
    const c = { "Todos": C_DISHES.length };
    C_DISHES.forEach(d => { c[d.cat] = (c[d.cat] || 0) + 1; });
    return c;
  }, []);

  return (
    <>
      <div className="c-page-head" data-screen-label="03 Menú">
        <h1>Nuestra carta</h1>
        <div className="sub">Platos preparados al momento con ingredientes frescos de la región</div>
      </div>
      <div className="c-menu-head">
        <div className="c-menu-search">
          <CSearch size={16}/>
          <input placeholder="Buscar platillos, bebidas, postres..." value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <button className="c-cart-btn" onClick={openCart}>
          <CBag size={16}/> Mi pedido
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </button>
      </div>

      <div className="c-cats">
        {cats.map(c => (
          <button key={c} className={`c-cat ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
            <span>{catIco[c]}</span> {c}
            <span className="count">{counts[c] || 0}</span>
          </button>
        ))}
      </div>

      <div className="c-menu-grid">
        {filtered.map(d => {
          const qty = cart[d.id] || 0;
          return (
            <div key={d.id} className="c-dish">
              <div className="c-dish-img" style={{ backgroundImage: `url(${(window.__resources && window.__resources["dish-" + d.id]) || d.img})` }}>
                <div className="c-dish-badges">
                  {d.featured && <span className="c-dish-badge featured"><CFlame size={11}/> Popular</span>}
                  {d.isNew && <span className="c-dish-badge new"><CSpark size={11}/> Nuevo</span>}
                </div>
                <button className={`c-dish-fav ${favs.has(d.id) ? "on" : ""}`}
                        onClick={() => toggleFav(d.id)}>
                  {favs.has(d.id) ? <CHeartFill size={16}/> : <CHeart size={16}/>}
                </button>
              </div>
              <div className="c-dish-body">
                <h3 className="c-dish-name">{d.name}</h3>
                <p className="c-dish-desc">{d.desc}</p>
                <div className="c-dish-meta">
                  <span><CClock size={11}/> {d.prep} min</span>
                  <span>· {d.cat}</span>
                </div>
                <div className="c-dish-foot">
                  <div className="c-dish-price"><span className="currency">S/ </span>{d.price}</div>
                  {qty === 0 ? (
                    <button className="c-add" onClick={() => addToCart(d)}>
                      <CPlus size={13}/> Agregar
                    </button>
                  ) : (
                    <div className="c-qty">
                      <button onClick={() => removeFromCart(d.id)}>−</button>
                      <span className="v tnum">{qty}</span>
                      <button onClick={() => addToCart(d)}>+</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

// ================= CART DRAWER =================
const CCartDrawer = ({ open, onClose, cart, addToCart, removeFromCart, clearItem, onCheckout }) => {
  const items = useCM(() => {
    return Object.entries(cart).map(([id, qty]) => {
      const dish = C_DISHES.find(d => d.id === Number(id));
      return dish ? { ...dish, qty } : null;
    }).filter(Boolean);
  }, [cart]);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tip = Math.round(subtotal * 0.1);
  const total = subtotal + tip;
  return (
    <>
      <div className={`c-cart-overlay ${open ? "open" : ""}`} onClick={onClose}/>
      <aside className={`c-cart-drawer ${open ? "open" : ""}`}>
        <div className="c-cart-head">
          <h3>Mi pedido <span style={{ fontSize: 14, color: "var(--c-ink-3)", fontFamily: "Inter" }}>· {items.length} {items.length === 1 ? "artículo" : "artículos"}</span></h3>
          <button className="c-cart-close" onClick={onClose}><CClose size={18}/></button>
        </div>
        <div className="c-cart-list">
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--c-ink-3)" }}>
              <div style={{ fontSize: 14 }}>Aún no agregas nada al pedido.</div>
            </div>
          ) : items.map(it => (
            <div key={it.id} className="c-cart-item">
              <div className="c-cart-thumb" style={{ backgroundImage: `url(${(window.__resources && window.__resources["dish-" + it.id]) || it.img})` }}/>
              <div>
                <div className="c-cart-name">{it.name}</div>
                <div className="c-cart-price">S/ {it.price} · {it.qty} = S/ {it.price * it.qty}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <div className="c-qty" style={{ height: 30 }}>
                    <button onClick={() => removeFromCart(it.id)} style={{ height: 30 }}>−</button>
                    <span className="v tnum">{it.qty}</span>
                    <button onClick={() => addToCart(it)} style={{ height: 30 }}>+</button>
                  </div>
                </div>
              </div>
              <div className="c-cart-controls">
                <button className="c-cart-remove" onClick={() => clearItem(it.id)}>Quitar</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="c-cart-foot">
            <div className="c-cart-line"><span>Subtotal</span><span className="tnum">S/ {subtotal}</span></div>
            <div className="c-cart-line"><span>Propina sugerida (10%)</span><span className="tnum">S/ {tip}</span></div>
            <div className="c-cart-total">
              <span className="lbl">Total</span>
              <span className="val tnum"><span style={{ fontSize: 16, color: "var(--c-ink-3)" }}>S/ </span>{total}</span>
            </div>
            <button className="c-cart-checkout" onClick={onCheckout}>
              <CCheck size={16}/> Confirmar pedido
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

// ================= PEDIDOS =================
const CPedidos = ({ setActive }) => {
  const [filter, setFilter] = useCS("todos");
  const filtered = filter === "todos" ? C_ORDERS : C_ORDERS.filter(o => filter === "activos" ? o.status !== "done" : o.status === "done");

  const steps = ["Recibido", "Preparando", "Listo", "Entregado"];

  return (
    <>
      <div className="c-page-head" data-screen-label="04 Pedidos">
        <h1>Mis pedidos</h1>
        <div className="sub">Sigue tus pedidos en tiempo real y consulta tu historial</div>
      </div>

      <div className="c-cats" style={{ marginBottom: 22 }}>
        {[
          { id: "todos", label: "Todos", count: C_ORDERS.length },
          { id: "activos", label: "En curso", count: C_ORDERS.filter(o => o.status !== "done").length },
          { id: "historial", label: "Historial", count: C_ORDERS.filter(o => o.status === "done").length },
        ].map(f => (
          <button key={f.id} className={`c-cat ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.label} <span className="count">{f.count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="c-empty">
          <div className="c-empty-art"><div className="plate">U</div></div>
          <h3>Sin pedidos por aquí</h3>
          <p>Cuando hagas un pedido aparecerá en esta sección con seguimiento en tiempo real.</p>
          <button className="c-empty-cta" onClick={() => setActive("menu")}>
            <CMenu size={15}/> Ver menú
          </button>
        </div>
      ) : (
        <div className="c-orders">
          {filtered.map(o => (
            <div key={o.id} className="c-order">
              <div className="c-order-head">
                <div className="c-order-num">#{o.id.split("-")[1]}</div>
                <div className="c-order-info">
                  <div className="c-order-id">Pedido {o.id}</div>
                  <div className="c-order-meta">
                    <span><CClock size={12}/> {o.date}</span>
                    <span className="sep">·</span>
                    <span><CTable size={12}/> {o.table}</span>
                    <span className="sep">·</span>
                    <span>{o.items.reduce((a, b) => a + b.qty, 0)} artículos</span>
                  </div>
                </div>
                <div className={`c-order-status ${o.status}`}>
                  <span className="dot"/>
                  {o.status === "pending" ? "Recibido" : o.status === "cooking" ? "Preparando" : o.status === "ready" ? "Listo" : "Entregado"}
                </div>
              </div>
              {o.status !== "done" && (
                <div className="c-order-progress">
                  {steps.map((s, i) => (
                    <div key={s} className={`c-step ${i < o.step ? "done" : i === o.step ? "active" : ""}`}>
                      <div className="c-step-dot">
                        {i < o.step ? <CCheck size={13}/> : i + 1}
                      </div>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="c-order-items">
                {o.items.map((it, i) => (
                  <span key={i} className="c-order-item">
                    <span className="qty">{it.qty}</span>
                    {it.name}
                  </span>
                ))}
              </div>
              <div className="c-order-foot">
                <div className="c-order-total">Total <span className="tnum"><span className="currency">S/ </span>{o.total}</span></div>
                <div className="c-order-actions">
                  <button className="c-order-btn"><CRepeat size={13} style={{ marginRight: 6, verticalAlign: -2 }}/>Reordenar</button>
                  {o.status === "done" ? (
                    <button className="c-order-btn primary">Ver recibo</button>
                  ) : (
                    <button className="c-order-btn primary">Seguir en vivo</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ================= CHECKOUT MODAL =================
const CCheckout = ({ open, onClose, items, subtotal, onConfirm }) => {
  const [step, setStep] = useCS("review"); // review | pay | success
  const [method, setMethod] = useCS("card");
  const [tipPct, setTipPct] = useCS(10);
  const [table, setTable] = useCS("4");
  const [diners, setDiners] = useCS(2);
  const [note, setNote] = useCS("");

  useCE(() => { if (open) setStep("review"); }, [open]);

  const tip = Math.round(subtotal * tipPct / 100);
  const iva = Math.round(subtotal * 0.16 / 1.16);
  const total = subtotal + tip;

  if (!open) return null;

  return (
    <>
      <div className="c-co-back" onClick={onClose}/>
      <div className="c-co-modal" data-screen-label="05 Checkout">
        {step !== "success" && (
          <div className="c-co-head">
            <button className="c-co-close" onClick={onClose}><CClose size={18}/></button>
            <div className="c-co-steps">
              <div className={`c-co-step ${step === "review" ? "active" : "done"}`}>
                <span className="num">{step === "review" ? "1" : <CCheck size={12} strokeWidth={3}/>}</span>
                Revisar
              </div>
              <div className="c-co-step-line"/>
              <div className={`c-co-step ${step === "pay" ? "active" : ""}`}>
                <span className="num">2</span>
                Pagar
              </div>
            </div>
          </div>
        )}

        {step === "review" && (
          <>
            <div className="c-co-body">
              <div className="c-co-title">Confirma tu pedido</div>
              <div className="c-co-sub">Revisa los detalles antes de enviarlo a cocina</div>

              <div className="c-co-grid2">
                <div className="c-co-field">
                  <label>Mesa</label>
                  <div className="c-co-select-wrap">
                    <CTable size={14}/>
                    <select value={table} onChange={e => setTable(e.target.value)}>
                      <option>1</option><option>2</option><option>3</option>
                      <option>4</option><option>5</option><option>6</option>
                      <option>Llevar</option>
                    </select>
                  </div>
                </div>
                <div className="c-co-field">
                  <label>Comensales</label>
                  <div className="c-co-stepper">
                    <button onClick={() => setDiners(Math.max(1, diners - 1))}><CMinus size={14} strokeWidth={2.4}/></button>
                    <span className="v tnum">{diners}</span>
                    <button onClick={() => setDiners(Math.min(12, diners + 1))}><CPlus size={14} strokeWidth={2.4}/></button>
                  </div>
                </div>
              </div>

              <div className="c-co-items">
                {items.map(it => (
                  <div key={it.id} className="c-co-item">
                    <div className="c-co-item-thumb" style={{ backgroundImage: `url(${(window.__resources && window.__resources["dish-" + it.id]) || it.img})` }}/>
                    <div className="c-co-item-info">
                      <div className="c-co-item-name">{it.name}</div>
                      <div className="c-co-item-meta">×{it.qty} · S/ {it.price} c/u</div>
                    </div>
                    <div className="c-co-item-total tnum">S/ {it.price * it.qty}</div>
                  </div>
                ))}
              </div>

              <div className="c-co-field" style={{ marginTop: 18 }}>
                <label>Nota para la cocina <span style={{ color: "var(--c-ink-4)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span></label>
                <textarea
                  className="c-co-textarea"
                  placeholder="Ej: sin cebolla, alergia a nueces, todo al centro…"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <div className="c-co-summary">
                <div className="c-co-line"><span>Subtotal</span><span className="tnum">S/ {subtotal}</span></div>
                <div className="c-co-line muted"><span>IGV incluido</span><span className="tnum">S/ {iva}</span></div>
                <div className="c-co-line"><span>Propina ({tipPct}%)</span><span className="tnum">S/ {tip}</span></div>
                <div className="c-co-total">
                  <span className="lbl">Total</span>
                  <span className="val tnum"><span className="curr">S/ </span>{total}</span>
                </div>
              </div>
            </div>
            <div className="c-co-foot">
              <button className="c-co-btn ghost" onClick={onClose}>Seguir agregando</button>
              <button className="c-co-btn primary" onClick={() => { setStep("success"); setTimeout(() => onConfirm({ table, diners, total: subtotal, items, note }), 1400); }}>
                <CFlame size={14}/> Enviar a cocina
              </button>
            </div>
          </>
        )}

        {step === "success" && (
          <div className="c-co-success">
            <div className="c-co-success-circle">
              <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                <circle cx="34" cy="34" r="32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="201" strokeDashoffset="0" style={{ animation: "co-circle 0.5s ease-out forwards" }}/>
                <path d="M20 34l10 10 20-22" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" style={{ animation: "co-check 0.4s 0.5s ease-out forwards" }}/>
              </svg>
            </div>
            <div className="c-co-success-title">¡Pedido enviado a cocina!</div>
            <div className="c-co-success-sub">Mesa {table} · {diners} {diners === 1 ? "comensal" : "comensales"} · S/ {subtotal}</div>
            <div className="c-co-success-meta">Pagarás al final · abriendo seguimiento…</div>
          </div>
        )}
      </div>
    </>
  );
};

// ================= LIVE ORDER TRACKER =================
const C_TRACKER_STAGES = [
  { id: "received",  lbl: "Pedido recibido",  sub: "Cocina lo está revisando",   ico: <CCheck size={16}/> },
  { id: "preparing", lbl: "En preparación",   sub: "Tu chef está cocinando",     ico: <CFlame size={16}/> },
  { id: "plating",   lbl: "Emplatando",       sub: "Listo en pase",              ico: <CSpark size={16}/> },
  { id: "served",    lbl: "Servido en mesa",  sub: "¡Buen provecho!",            ico: <CBell size={16}/> },
];

const CTracker = ({ open, onClose, order, onPedirCuenta }) => {
  const [stage, setStage] = useCS(0);
  const [elapsed, setElapsed] = useCS(0);

  useCE(() => {
    if (!open) return;
    setStage(0); setElapsed(0);
    const adv = [
      setTimeout(() => setStage(1), 2200),
      setTimeout(() => setStage(2), 7000),
      setTimeout(() => setStage(3), 12000),
    ];
    const tick = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => { adv.forEach(clearTimeout); clearInterval(tick); };
  }, [open]);

  if (!open || !order) return null;

  const eta = Math.max(0, 18 - Math.floor(elapsed / 4));

  return (
    <>
      <div className="c-co-back" onClick={onClose}/>
      <div className="c-tr-modal" data-screen-label="06 Tracking">
        <div className="c-tr-head">
          <button className="c-co-close" onClick={onClose}><CClose size={18}/></button>
          <div>
            <div className="c-tr-eyebrow">Pedido #UTTOF-1042</div>
            <div className="c-tr-title">{stage < 3 ? "Tu pedido está en camino" : "¡Tu pedido fue servido!"}</div>
          </div>
          <div className="c-tr-eta">
            <div className="c-tr-eta-num tnum">{stage < 3 ? eta : "✓"}</div>
            <div className="c-tr-eta-lbl">{stage < 3 ? "min restantes" : "completado"}</div>
          </div>
        </div>

        <div className="c-tr-body">
          <div className="c-tr-progress">
            <div className="c-tr-progress-bar" style={{ width: `${(stage + 1) / 4 * 100}%` }}/>
          </div>

          <div className="c-tr-stages">
            {C_TRACKER_STAGES.map((s, i) => {
              const status = i < stage ? "done" : i === stage ? "active" : "wait";
              return (
                <div key={s.id} className={`c-tr-stage ${status}`}>
                  <div className="c-tr-dot">
                    {status === "done" ? <CCheck size={14} strokeWidth={3}/> :
                     status === "active" ? <span className="pulse"/> : null}
                  </div>
                  <div className="c-tr-info">
                    <div className="c-tr-stage-lbl">{s.lbl}</div>
                    <div className="c-tr-stage-sub">{s.sub}</div>
                  </div>
                  <div className="c-tr-time">
                    {status === "done" ? `${(i + 1) * 2}m` : status === "active" ? "ahora" : ""}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="c-tr-card">
            <div className="c-tr-card-head">
              <div className="c-tr-avatar">DR</div>
              <div style={{ flex: 1 }}>
                <div className="c-tr-card-title">Diego R. te atiende</div>
                <div className="c-tr-card-sub">Mesa {order.table} · {order.diners} {order.diners === 1 ? "comensal" : "comensales"}</div>
              </div>
              <button className="c-tr-bell"><CBell size={16}/></button>
            </div>
            {stage < 3 ? (
              <div className="c-tr-actions">
                <button className="c-tr-action"><CPlus size={13}/> Agregar más</button>
                <button className="c-tr-action">Llamar mesero</button>
              </div>
            ) : (
              <button className="c-tr-pay-cta" onClick={onPedirCuenta}>
                <span className="lbl">Pedir la cuenta</span>
                <span className="amt tnum">S/ {order.total}</span>
                <CArrow size={16}/>
              </button>
            )}
          </div>

          <div className="c-tr-summary">
            <div className="c-tr-summary-row">
              <span>{stage < 3 ? "Subtotal del pedido" : "Listo para cobrar"}</span>
              <span className="tnum"><b>S/ {order.total}</b></span>
            </div>
            <div className="c-tr-summary-row muted">
              <span>{stage < 3 ? "Pagarás al final · propina al cobrar" : "Elige tu método en la siguiente pantalla"}</span>
              <span>UTTOF-1042</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ================= ROOT =================
const CClienteApp = () => {
  const [active, setActive] = useCS("inicio");
  // Flujo de entrada walk-in: "scan" → "confirm" → null (app)
  const [checkin, setCheckin] = useCS("scan");
  const [mesa, setMesa] = useCS({ num: 5, zone: "Terraza", cap: 4 });
  const [cart, setCart] = useCS({});
  const [cartOpen, setCartOpen] = useCS(false);
  const [favs, setFavs] = useCS(new Set([4, 7, 11]));
  const [toast, setToast] = useCS(null);
  const [cuentaOpen, setCuentaOpen] = useCS(false);
  const [reciboOpen, setReciboOpen] = useCS(false);
  const [paidReceipt, setPaidReceipt] = useCS(null);
  const [coOpen, setCoOpen] = useCS(false);
  const [trackerOpen, setTrackerOpen] = useCS(false);
  const [activeOrder, setActiveOrder] = useCS(null);

  const cartItems = useCM(() => Object.entries(cart).map(([id, qty]) => {
    const d = C_DISHES.find(x => x.id === Number(id));
    return d ? { ...d, qty } : null;
  }).filter(Boolean), [cart]);
  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const addToCart = (dish) => {
    setCart(c => ({ ...c, [dish.id]: (c[dish.id] || 0) + 1 }));
    setToast(`${dish.name} agregado al pedido`);
  };
  const removeFromCart = (id) => {
    setCart(c => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });
  };
  const clearItem = (id) => setCart(c => { const n = { ...c }; delete n[id]; return n; });

  const toggleFav = (id) => setFavs(f => {
    const next = new Set(f);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  useCE(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  // Gate de entrada: escanear QR → confirmación → app
  if (checkin === "scan") {
    return <CScanQR onDetected={() => setCheckin("confirm")} onManual={() => setCheckin("confirm")}/>;
  }
  if (checkin === "confirm") {
    return <CCheckin mesa={mesa}
                     onVerMenu={() => { setCheckin(null); setActive("menu"); }}
                     onRescan={() => setCheckin("scan")}/>;
  }

  return (
    <div className="cliente">
      <CTopbar active={active} setActive={setActive} cartCount={cartCount} onCart={() => setCartOpen(true)}/>
      <main className="c-page">
        {active === "inicio"   && <CInicio setActive={setActive} addToCart={addToCart} favs={favs} toggleFav={toggleFav}/>}
        {active === "reservar" && <CReservar/>}
        {active === "menu"     && <CMenuPage cart={cart} addToCart={addToCart} removeFromCart={removeFromCart}
                                              openCart={() => setCartOpen(true)} favs={favs} toggleFav={toggleFav}
                                              setActive={setActive}/>}
        {active === "pedidos"  && <CPedidos setActive={setActive}/>}
      </main>
      <CCartDrawer open={cartOpen} onClose={() => setCartOpen(false)}
                   cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} clearItem={clearItem}
                   onCheckout={() => { setCartOpen(false); setCoOpen(true); }}/>
      <CCheckout open={coOpen} onClose={() => setCoOpen(false)} items={cartItems} subtotal={cartSubtotal}
                 onConfirm={(order) => { setCoOpen(false); setActiveOrder(order); setCart({}); setTrackerOpen(true); }}/>
      <CTracker open={trackerOpen} onClose={() => { setTrackerOpen(false); setActive("pedidos"); }} order={activeOrder}
                onPedirCuenta={() => { setTrackerOpen(false); setCuentaOpen(true); }}/>
      <CCuenta open={cuentaOpen} onClose={() => setCuentaOpen(false)} order={activeOrder}
               onPaid={(receipt) => { setCuentaOpen(false); setPaidReceipt(receipt); setReciboOpen(true); }}/>
      <CRecibo open={reciboOpen} receipt={paidReceipt}
               onClose={() => { setReciboOpen(false); setActiveOrder(null); setPaidReceipt(null); setActive("pedidos"); }}/>
      <div className={`c-toast ${toast ? "show" : ""}`}>
        <span className="ico"><CCheck size={13}/></span>
        {toast}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<CClienteApp/>);
