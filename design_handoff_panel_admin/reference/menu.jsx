// Menu page

const { useState: useSt, useMemo: useMm } = React;

const CATS = [
  { id: "all",         label: "Todas",        color: "var(--ink-500)" },
  { id: "Entrada",     label: "Entradas",     color: "var(--sage-500)" },
  { id: "Plato Fuerte", label: "Platos Fuertes", color: "var(--terracotta-500)" },
  { id: "Postre",      label: "Postres",      color: "var(--wine-500)" },
  { id: "Bebida",      label: "Bebidas",      color: "var(--sky-500)" },
];

const catSlug = (c) => "cat-" + c.replace(/\s+/g, "");

const MenuSummary = () => {
  const total = MENU_DATA.length;
  const available = MENU_DATA.filter(d => d.status === "available").length;
  const lowOrOut = MENU_DATA.filter(d => d.status === "low" || d.status === "out").length;
  const featured = MENU_DATA.filter(d => d.featured).length;
  const totalSold = MENU_DATA.reduce((a, d) => a + d.sold, 0);
  const totalRevenue = MENU_DATA.reduce((a, d) => a + d.sold * d.price, 0);
  const items = [
    { label: "Platillos activos", value: `${available}/${total}`, ico: IconMenu, bg: "var(--cream-200)", color: "var(--ink-700)" },
    { label: "Vendidos hoy",      value: totalSold,                ico: IconReceipt, bg: "var(--sage-100)", color: "var(--sage-500)" },
    { label: "Ingresos del menú", value: `$${fmt$(totalRevenue)}`, ico: IconDollar,  bg: "var(--terracotta-50)", color: "var(--terracotta-500)" },
    { label: "Atención requerida",value: lowOrOut,                 ico: IconAlertTriangle, bg: "var(--saffron-100)", color: "var(--saffron-500)" },
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
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DishCard = ({ dish, onEdit }) => {
  const [fav, setFav] = useSt(dish.featured);
  const isOut = dish.status === "out";
  return (
    <div className={`dish-card ${isOut ? "out-of-stock" : ""}`}>
      <div className="dish-img" style={{ backgroundImage: `url(${dish.img})` }}>
        <div className="badge-stack">
          {dish.featured && <span className="dish-badge featured"><IconFlame size={10} strokeWidth={2.5}/> Destacado</span>}
          {dish.status === "low" && <span className="dish-badge low"><IconAlertTriangle size={10} strokeWidth={2.5}/> Stock bajo</span>}
          {dish.status === "out" && <span className="dish-badge out"><IconX size={10} strokeWidth={2.5}/> Agotado</span>}
        </div>
        <button className="dish-fav" title="Destacar" onClick={() => setFav(!fav)}>
          <IconStar size={15} fill={fav ? "var(--terracotta-500)" : "none"} style={{ color: fav ? "var(--terracotta-500)" : undefined }}/>
        </button>
      </div>
      <div className="dish-body">
        <div className="dish-title-row">
          <div>
            <div className="dish-cat">
              <span className={`cat-dot ${catSlug(dish.cat)}`}/>
              {dish.cat}
            </div>
            <div className="dish-title serif">{dish.name}</div>
          </div>
          <div className="dish-price serif">${dish.price}</div>
        </div>
        <div className="dish-desc">{dish.desc}</div>
      </div>
      <div className="dish-metrics">
        <span className="dish-metric"><IconReceipt size={12}/> <b>{dish.sold}</b> hoy</span>
        <span className="dish-metric"><IconClock size={12}/> <b>{dish.prepTime}</b> min</span>
        <span className="dish-metric"><IconTrendUp size={12}/> <b>{dish.margin}%</b> margen</span>
      </div>
      <div className="dish-actions">
        <button className="btn-edit" onClick={() => onEdit(dish)}>
          <IconSettings size={14}/> Editar
        </button>
        <button className="icon-action" title="Duplicar"><IconPackage size={15}/></button>
        <button className="icon-action danger" title="Eliminar"><IconX size={15}/></button>
      </div>
    </div>
  );
};

const ListRow = ({ dish, onEdit }) => {
  const status = dish.status === "available" ? "Disponible" : dish.status === "low" ? "Stock bajo" : "Agotado";
  const sColor = dish.status === "available" ? "var(--sage-500)" : dish.status === "low" ? "var(--saffron-500)" : "var(--wine-500)";
  return (
    <div className="list-row">
      <div className="list-thumb" style={{ backgroundImage: `url(${dish.img})` }}/>
      <div>
        <div className="list-name">{dish.name}</div>
        <div className="list-desc">{dish.desc}</div>
      </div>
      <div className="dish-cat">
        <span className={`cat-dot ${catSlug(dish.cat)}`}/>
        {dish.cat}
      </div>
      <div style={{ fontWeight: 600, color: "var(--terracotta-600)", fontVariantNumeric: "tabular-nums" }}>${dish.price}</div>
      <div style={{ fontVariantNumeric: "tabular-nums", color: "var(--ink-700)", fontSize: 13.5 }}>
        <b>{dish.sold}</b> <span style={{ color: "var(--ink-500)", fontSize: 12 }}>vendidos</span>
      </div>
      <div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 12, color: sColor, fontWeight: 600
        }}>
          <span className="status-dot" style={{ background: sColor }}/>
          {status}
        </span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button className="icon-action" onClick={() => onEdit(dish)} title="Editar"><IconSettings size={14}/></button>
        <button className="icon-action danger" title="Eliminar"><IconX size={14}/></button>
      </div>
    </div>
  );
};

const EditDrawer = ({ dish, open, onClose }) => {
  if (!dish && !open) return null;
  const d = dish || { name: "", cat: "Entrada", price: 0, desc: "", img: "", featured: false, allergens: [], prepTime: 10, status: "available" };
  const [feat, setFeat] = useSt(d.featured);
  const [avail, setAvail] = useSt(d.status === "available");

  React.useEffect(() => {
    if (dish) {
      setFeat(dish.featured);
      setAvail(dish.status === "available");
    }
  }, [dish]);

  return (
    <>
      <div className={`drawer-backdrop ${open ? "open" : ""}`} onClick={onClose}/>
      <div className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-head">
          <h2 className="serif">{dish ? "Editar platillo" : "Nuevo platillo"}</h2>
          <button className="icon-btn" onClick={onClose}><IconX size={18}/></button>
        </div>
        <div className="drawer-body">
          {d.img && (
            <div className="drawer-img" style={{ backgroundImage: `url(${d.img})` }}>
              <div className="drawer-img-overlay"><IconDownload size={12}/> Cambiar foto</div>
            </div>
          )}
          <div className="field">
            <label>Nombre</label>
            <input type="text" defaultValue={d.name}/>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Categoría</label>
              <select defaultValue={d.cat}>
                {CATS.filter(c => c.id !== "all").map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Precio</label>
              <input type="number" defaultValue={d.price}/>
            </div>
          </div>
          <div className="field">
            <label>Descripción</label>
            <textarea defaultValue={d.desc}/>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Tiempo prep. (min)</label>
              <input type="number" defaultValue={d.prepTime}/>
            </div>
            <div className="field">
              <label>Margen (%)</label>
              <input type="number" defaultValue={d.margin}/>
            </div>
          </div>
          <div className="field">
            <label>Alérgenos</label>
            <div>
              {(d.allergens || []).map(a => (
                <span key={a} className="allergen-chip">{a}</span>
              ))}
              <button className="allergen-chip" style={{ background: "var(--surface)", border: "1px dashed var(--border-strong)", cursor: "pointer" }}>
                <IconPlus size={11}/> agregar
              </button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div className="toggle" onClick={() => setAvail(!avail)} style={{ cursor: "pointer", justifyContent: "space-between", display: "flex", width: "100%" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Disponible</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Visible para los clientes</div>
              </div>
              <div className={`toggle ${avail ? "on" : ""}`}><div className="switch"/></div>
            </div>
            <div className="toggle" onClick={() => setFeat(!feat)} style={{ cursor: "pointer", justifyContent: "space-between", display: "flex", width: "100%" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>Destacado</div>
                <div style={{ fontSize: 12, color: "var(--ink-500)" }}>Aparece arriba en el menú del cliente</div>
              </div>
              <div className={`toggle ${feat ? "on" : ""}`}><div className="switch"/></div>
            </div>
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn" onClick={onClose}>Cancelar</button>
          <button className="btn btn-accent" onClick={onClose}><IconCheck size={15}/> Guardar cambios</button>
        </div>
      </div>
    </>
  );
};

const MenuPage = () => {
  const [cat, setCat] = useSt("all");
  const [view, setView] = useSt("grid");
  const [q, setQ] = useSt("");
  const [editing, setEditing] = useSt(null);
  const [open, setOpen] = useSt(false);

  const counts = useMm(() => {
    const c = { all: MENU_DATA.length };
    MENU_DATA.forEach(d => { c[d.cat] = (c[d.cat] || 0) + 1; });
    return c;
  }, []);

  const filtered = useMm(() => {
    return MENU_DATA.filter(d => {
      if (cat !== "all" && d.cat !== cat) return false;
      if (q && !d.name.toLowerCase().includes(q.toLowerCase()) && !d.desc.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [cat, q]);

  const openEdit = (dish) => { setEditing(dish); setOpen(true); };
  const openNew  = () => { setEditing(null); setOpen(true); };

  return (
    <>
      <MenuSummary/>

      <div className="menu-toolbar">
        <div className="search-input">
          <span className="ico"><IconSearch size={16}/></span>
          <input placeholder="Buscar por nombre o ingrediente…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="cat-pills">
          {CATS.map(c => (
            <button key={c.id}
                    className={`cat-pill ${cat === c.id ? "active" : ""}`}
                    onClick={() => setCat(c.id)}>
              {c.id !== "all" && <span className="status-dot" style={{ background: c.color }}/>}
              {c.label}
              <span className="badge">{counts[c.id] || 0}</span>
            </button>
          ))}
        </div>
        <div className="view-toggle">
          <button className={view === "grid" ? "active" : ""} onClick={() => setView("grid")} title="Cuadrícula">
            <IconDashboard size={15}/>
          </button>
          <button className={view === "list" ? "active" : ""} onClick={() => setView("list")} title="Lista">
            <IconMenu size={15}/>
          </button>
        </div>
        <button className="btn btn-accent" onClick={openNew}>
          <IconPlus size={15}/> Agregar platillo
        </button>
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: 60, textAlign: "center", color: "var(--ink-500)", background: "var(--surface)", border: "1px dashed var(--border-strong)", borderRadius: "var(--r-lg)" }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, color: "var(--ink-700)", marginBottom: 6 }}>Sin resultados</div>
          <div>Prueba con otra categoría o término de búsqueda.</div>
        </div>
      )}

      {view === "grid" ? (
        <div className="menu-grid">
          {filtered.map(d => <DishCard key={d.id} dish={d} onEdit={openEdit}/>)}
        </div>
      ) : (
        <div className="menu-list">
          <div className="list-row head">
            <div></div>
            <div>Platillo</div>
            <div>Categoría</div>
            <div>Precio</div>
            <div>Vendidos</div>
            <div>Estado</div>
            <div></div>
          </div>
          {filtered.map(d => <ListRow key={d.id} dish={d} onEdit={openEdit}/>)}
        </div>
      )}

      <EditDrawer dish={editing} open={open} onClose={() => setOpen(false)}/>
    </>
  );
};

window.MenuPage = MenuPage;
