/* ============================================
   UTTOF — App de Mesero
   3 pantallas: Mesas / Detalle / Agregar platillos
   ============================================ */

const { useState, useEffect, useRef } = React;

/* ---------- Pantalla 1: Mesas asignadas ---------- */
function MesasView({ onOpen, mesas }) {
  const [filter, setFilter] = useState("Todas");
  const [now, setNow] = useState(new Date(2026, 3, 29, 14, 10));
  useEffect(() => {
    const t = setInterval(() => setNow(new Date(Date.now())), 30000);
    return () => clearInterval(t);
  }, []);

  const filters = [
    { id: "Todas", count: mesas.length },
    { id: "Ocupadas", count: mesas.filter(m => m.status === "ocupada").length },
    { id: "Atención", count: mesas.filter(m => m.alert > 0 || m.status === "lista").length },
    { id: "Libres", count: mesas.filter(m => m.status === "libre").length },
  ];

  const filtered = mesas.filter(m => {
    if (filter === "Todas") return true;
    if (filter === "Ocupadas") return m.status === "ocupada";
    if (filter === "Atención") return m.alert > 0 || m.status === "lista";
    if (filter === "Libres") return m.status === "libre";
    return true;
  });

  const totalVentas = mesas.reduce((s, m) => s + (m.total || 0), 0);
  const mesasActivas = mesas.filter(m => m.status !== "libre").length;
  const comensales = mesas.reduce((s, m) => s + (m.occupied || 0), 0);

  return (
    <>
      <div className="m-top">
        <div className="m-top-row">
          <div>
            <div className="m-greet">Buenas tardes</div>
            <div className="m-name">Diego R.</div>
          </div>
          <div className="m-shift-pill">
            <span className="dot"/>
            Turno · 4h 12m
          </div>
        </div>
        <div className="m-stats">
          <div className="m-stat">
            <div className="m-stat-val"><span className="currency">S/ </span>{totalVentas.toLocaleString("es-PE")}</div>
            <div className="m-stat-lbl">Ventas turno</div>
          </div>
          <div className="m-stat">
            <div className="m-stat-val">{mesasActivas}<span className="currency" style={{marginLeft:4,fontSize:13,color:'var(--m-ink-3)'}}>/{mesas.length}</span></div>
            <div className="m-stat-lbl">Mesas</div>
          </div>
          <div className="m-stat">
            <div className="m-stat-val">{comensales}</div>
            <div className="m-stat-lbl">Comensales</div>
          </div>
        </div>
      </div>

      <div className="m-search">
        <Icon.search size={16}/>
        <input placeholder="Buscar mesa, orden o cuenta…"/>
      </div>

      <div className="m-tabs">
        {filters.map(f => (
          <button key={f.id} className={`m-tab ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>
            {f.id} <span className="badge">{f.count}</span>
          </button>
        ))}
      </div>

      <div className="m-body">
        <div className="m-mesas">
          {filtered.map(m => <MesaCard key={m.id} mesa={m} onClick={() => onOpen(m.id)}/>)}
        </div>
      </div>

      <div className="m-cta-bar">
        <button className="m-fab">
          <Icon.plus size={18} sw={2.4}/>
          Nueva orden
        </button>
      </div>
    </>
  );
}

function MesaCard({ mesa, onClick }) {
  const labels = { libre: "Libre", ocupada: "Activa", lista: "Plato listo" };
  return (
    <button className={`m-mesa ${mesa.status}`} onClick={mesa.status !== "libre" ? onClick : undefined}>
      {mesa.alert > 0 && <span className="m-mesa-alert">!</span>}
      <div className="m-mesa-row">
        <div>
          <div className="m-mesa-num">Mesa {mesa.id}</div>
          <div className="m-mesa-zone">{mesa.zone}</div>
        </div>
        <div className="m-mesa-status">
          <span className="dot"/>{labels[mesa.status]}
        </div>
      </div>

      {mesa.status === "libre" ? (
        <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--m-ink-4)', fontSize:11.5, gap:6}}>
          <Icon.users size={14}/> {mesa.seats} lugares
        </div>
      ) : (
        <>
          <div className="m-mesa-meta">
            <span><Icon.users size={12}/> {mesa.occupied}/{mesa.seats}</span>
            <span><Icon.utensils size={12}/> {mesa.items} platos</span>
          </div>
          <div style={{fontSize:11, color:'var(--m-ink-3)', display:'flex', alignItems:'center', gap:5}}>
            <Icon.flame size={12}/> {mesa.progressLabel}
          </div>
          <div className="m-mesa-foot">
            <div className="m-mesa-total">S/ {mesa.total.toLocaleString("es-PE")}</div>
            <div className="m-mesa-time">{mesa.elapsedMin} min</div>
          </div>
        </>
      )}
    </button>
  );
}

/* ---------- Pantalla 2: Detalle mesa ---------- */
function MesaDetail({ onBack, onAdd }) {
  const orden = window.ORDEN_MESA_4;
  const [toast, setToast] = useState(null);
  const [splitOpen, setSplitOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [paid, setPaid] = useState(false);
  const subtotal = orden.reduce((s, i) => s + i.qty * i.price, 0);
  const propina = Math.round(subtotal * 0.10);
  const total = subtotal + propina;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <>
      <div className="m-detail-head">
        <button className="m-back" onClick={onBack}><Icon.back size={18}/></button>
        <div>
          <div className="m-detail-title">Mesa 4</div>
          <div className="m-detail-sub">Terraza · 4 comensales · 28 min</div>
        </div>
        <button className="m-detail-action"><Icon.more size={18}/></button>
      </div>

      <div className="m-body">
        <div className="m-info-card">
          <div className="m-info-row">
            <div>
              <div style={{fontSize:11, opacity:0.7, letterSpacing:'0.04em', textTransform:'uppercase', fontWeight:600, marginBottom:4}}>Orden #1042</div>
              <div className="m-info-num">S/ 168<span style={{fontSize:14, opacity:0.6, marginLeft:4}}>.00</span></div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{fontSize:11, opacity:0.7, marginBottom:4}}>Curso actual</div>
              <div style={{fontSize:14, fontWeight:600, fontFamily:'Fraunces, Georgia, serif'}}>Plato fuerte</div>
            </div>
          </div>
          <div className="m-info-meta">
            <span><Icon.clock size={11}/> 13:42</span>
            <span><Icon.users size={11}/> 4 personas</span>
            <span><Icon.chef size={11}/> 3 en cocina</span>
          </div>
        </div>

        <div className="m-actions-row">
          <button className="m-action-mini" onClick={() => showToast("Cocina notificada — Mesa 4")}>
            <div className="m-action-mini-ico coral"><Icon.bell size={16}/></div>
            <div className="m-action-mini-lbl">Llamar cocina</div>
          </button>
          <button className="m-action-mini" onClick={() => setSplitOpen(true)}>
            <div className="m-action-mini-ico mint"><Icon.split size={16}/></div>
            <div className="m-action-mini-lbl">Dividir cuenta</div>
          </button>
          <button className="m-action-mini" onClick={() => showToast("Selecciona la mesa destino")}>
            <div className="m-action-mini-ico sun"><Icon.swap size={16}/></div>
            <div className="m-action-mini-lbl">Cambiar mesa</div>
          </button>
          <button className="m-action-mini" onClick={() => showToast("Cuenta enviada al cliente")}>
            <div className="m-action-mini-ico ink"><Icon.qr size={16}/></div>
            <div className="m-action-mini-lbl">Cuenta QR</div>
          </button>
        </div>

        <div className="m-section-title">
          <h3>Orden actual</h3>
          <span className="meta">{orden.length} platos · {orden.reduce((s,i)=>s+i.qty,0)} unidades</span>
        </div>

        <div className="m-order-list">
          {orden.map(item => <OrderItem key={item.id} item={item}/>)}
        </div>

        <div className="m-bill">
          <div className="m-bill-line"><span>Subtotal</span><span>S/ {subtotal.toLocaleString("es-PE")}.00</span></div>
          <div className="m-bill-line"><span>Servicio sugerido (10%)</span><span>S/ {propina.toLocaleString("es-PE")}.00</span></div>
          <div className="m-bill-line"><span>IGV incluido (18%)</span><span>S/ 26.00</span></div>
          <div className="m-bill-total">
            <span className="lbl">Total</span>
            <span className="val">S/ {total.toLocaleString("es-PE")}<span style={{fontSize:14, opacity:0.55}}>.00</span></span>
          </div>
        </div>

        <div className="m-bottom-actions">
          <button className="m-btn ghost" onClick={onAdd}>
            <Icon.plus size={15} sw={2.4}/> Agregar platillo
          </button>
          <button className="m-btn primary" onClick={() => setPayOpen(true)}>
            <Icon.receipt size={15}/> Cobrar cuenta
          </button>
        </div>
      </div>

      <div className={`m-toast ${toast ? 'show' : ''}`}>
        <div className="ico"><Icon.check size={12} sw={3}/></div>
        {toast}
      </div>

      <SplitSheet open={splitOpen} onClose={() => setSplitOpen(false)} total={total}/>
      <PaySheet open={payOpen} onClose={() => setPayOpen(false)} total={total}
        onComplete={() => { setPayOpen(false); setPaid(true); }}/>

      <div className={`m-success ${paid ? 'show' : ''}`}>
        <div className="m-success-circle"><Icon.check size={44} sw={3}/></div>
        <div className="m-success-title">¡Pago completado!</div>
        <div className="m-success-sub">Mesa 4 liberada · ticket enviado al cliente</div>
        <button className="m-btn primary" style={{marginTop:8, padding:'12px 22px'}} onClick={() => { setPaid(false); onBack(); }}>
          Volver a mesas
        </button>
      </div>
    </>
  );
}

function OrderItem({ item }) {
  const statusLabel = { delivered: "Entregado", cooking: "En cocina", ready: "Listo en pase" };
  return (
    <div className="m-order-item">
      <div className="m-order-qty">×{item.qty}</div>
      <div>
        <div className="m-order-name">{item.name}</div>
        {item.note && <div className="m-order-note">{item.note}</div>}
        <span className={`m-order-tag ${item.status}`}>{statusLabel[item.status]}</span>
      </div>
      <div className="m-order-price">S/ {(item.qty * item.price).toLocaleString("es-PE")}</div>
    </div>
  );
}

/* ---------- Pantalla 3: Agregar platillos ---------- */
function AddDishes({ onBack, onSend }) {
  const [cat, setCat] = useState("Entradas");
  const [cart, setCart] = useState({});
  const cats = Object.keys(window.MENU_DATA);
  const dishes = window.MENU_DATA[cat] || [];

  const inc = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const dec = (id) => setCart(c => {
    const v = (c[id] || 0) - 1;
    const next = { ...c };
    if (v <= 0) delete next[id]; else next[id] = v;
    return next;
  });

  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);
  let cartTotal = 0;
  for (const k of Object.keys(cart)) {
    for (const c of cats) {
      const d = window.MENU_DATA[c].find(x => x.id === k);
      if (d) cartTotal += d.price * cart[k];
    }
  }

  return (
    <>
      <div className="m-detail-head">
        <button className="m-back" onClick={onBack}><Icon.back size={18}/></button>
        <div>
          <div className="m-detail-title">Agregar platillos</div>
          <div className="m-detail-sub">Mesa 4 · Terraza</div>
        </div>
        <button className="m-detail-action"><Icon.filter size={16}/></button>
      </div>

      <div className="m-search">
        <Icon.search size={16}/>
        <input placeholder="Buscar en el menú…"/>
      </div>

      <div className="m-cats">
        {cats.map(c => (
          <button key={c} className={`m-cat ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="m-body" style={{paddingBottom: cartCount > 0 ? 110 : 30}}>
        <div className="m-dish-list">
          {dishes.map(d => (
            <DishRow
              key={d.id}
              dish={d}
              qty={cart[d.id] || 0}
              onAdd={() => inc(d.id)}
              onSub={() => dec(d.id)}
            />
          ))}
          {dishes.length === 0 && (
            <div style={{padding:'40px 20px', textAlign:'center', color:'var(--m-ink-4)', fontSize:13}}>
              Sin platillos en esta categoría
            </div>
          )}
        </div>
      </div>

      {cartCount > 0 && (
        <div className="m-cart-bar">
          <div className="m-cart-info">
            <div className="m-cart-count">{cartCount} platos en orden</div>
            <div className="m-cart-total tnum">S/ {cartTotal.toLocaleString("es-PE")}.00</div>
          </div>
          <button className="m-cart-send" onClick={onSend}>
            <Icon.send size={14}/> Enviar a cocina
          </button>
        </div>
      )}
    </>
  );
}

function DishRow({ dish, qty, onAdd, onSub }) {
  return (
    <div className="m-dish">
      <div className="m-dish-img" style={{backgroundImage: `url("${dish.img}")`}}/>
      <div className="m-dish-info">
        <h4 className="m-dish-name">{dish.name}</h4>
        <div className="m-dish-meta">
          <span><Icon.clock size={10}/> {dish.time} min</span>
          {dish.spice > 0 && (
            <span style={{color:'var(--m-coral)'}}>
              {Array(dish.spice).fill(0).map((_,i)=><Icon.pepper key={i} size={10}/>)}
            </span>
          )}
        </div>
        <div className="m-dish-price">S/ {dish.price}</div>
      </div>
      {qty === 0 ? (
        <button className="m-dish-add" onClick={onAdd}><Icon.plus size={16} sw={2.6}/></button>
      ) : (
        <div className="m-dish-qty">
          <button onClick={onSub}><Icon.minus size={14} sw={2.6}/></button>
          <span className="v">{qty}</span>
          <button onClick={onAdd}><Icon.plus size={14} sw={2.6}/></button>
        </div>
      )}
    </div>
  );
}

/* ---------- Bottom sheet wrapper ---------- */
function Sheet({ open, onClose, title, children, footer }) {
  return (
    <>
      <div className={`m-sheet-back ${open ? 'show' : ''}`} onClick={onClose}/>
      <div className={`m-sheet ${open ? 'show' : ''}`}>
        <div className="m-sheet-handle"/>
        <div className="m-sheet-head">
          <div className="m-sheet-title">{title}</div>
          <button className="m-sheet-close" onClick={onClose}><Icon.plus size={16} sw={2.4} style={{transform:'rotate(45deg)'}}/></button>
        </div>
        <div className="m-sheet-body">{children}</div>
        {footer && <div className="m-sheet-foot">{footer}</div>}
      </div>
    </>
  );
}

/* ---------- Sheet: dividir cuenta ---------- */
function SplitSheet({ open, onClose, total }) {
  const [mode, setMode] = useState("equal");
  const [people, setPeople] = useState(4);
  const perPerson = Math.ceil(total / people);

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Dividir cuenta"
      footer={
        <button className="m-btn primary" style={{width:'100%'}} onClick={onClose}>
          <Icon.check size={15} sw={2.4}/> Aplicar división
        </button>
      }
    >
      <p style={{fontSize:13, color:'var(--m-ink-3)', margin:'0 0 14px'}}>
        Elige cómo dividir el total de <b style={{color:'var(--m-ink)'}}>S/ {total.toLocaleString("es-PE")}.00</b>.
      </p>

      <div className="m-split-modes">
        <button className={`m-split-mode ${mode === 'equal' ? 'active' : ''}`} onClick={() => setMode('equal')}>
          <Icon.users size={20}/>
          <span className="m-split-mode-lbl">Partes iguales</span>
        </button>
        <button className={`m-split-mode ${mode === 'item' ? 'active' : ''}`} onClick={() => setMode('item')}>
          <Icon.utensils size={20}/>
          <span className="m-split-mode-lbl">Por platillo</span>
        </button>
        <button className={`m-split-mode ${mode === 'custom' ? 'active' : ''}`} onClick={() => setMode('custom')}>
          <Icon.edit size={18}/>
          <span className="m-split-mode-lbl">Personalizado</span>
        </button>
      </div>

      {mode === 'equal' && (
        <>
          <div className="m-split-stepper">
            <div className="m-split-stepper-lbl">Número de personas</div>
            <div className="m-split-stepper-ctrl">
              <button onClick={() => setPeople(Math.max(2, people - 1))}><Icon.minus size={14} sw={2.6}/></button>
              <span className="v">{people}</span>
              <button onClick={() => setPeople(Math.min(12, people + 1))}><Icon.plus size={14} sw={2.6}/></button>
            </div>
          </div>
          <div className="m-split-result">
            <div>
              <div className="m-split-result-lbl">Cada uno paga</div>
              <div className="m-split-result-val">S/ {perPerson.toLocaleString("es-PE")}</div>
            </div>
            <div className="m-split-per">
              {people} cuentas<br/>iguales
            </div>
          </div>
        </>
      )}

      {mode === 'item' && (
        <div style={{padding:'16px', background:'var(--m-surface)', borderRadius:14, fontSize:13, color:'var(--m-ink-3)', textAlign:'center'}}>
          Asigna cada platillo a un comensal en la siguiente pantalla.
        </div>
      )}

      {mode === 'custom' && (
        <div style={{padding:'16px', background:'var(--m-surface)', borderRadius:14, fontSize:13, color:'var(--m-ink-3)', textAlign:'center'}}>
          Define montos exactos por cada cuenta.
        </div>
      )}
    </Sheet>
  );
}

/* ---------- Sheet: cobrar ---------- */
function PaySheet({ open, onClose, total, onComplete }) {
  const [method, setMethod] = useState("card");
  const propina10 = Math.round(total * 0.10);
  const propina15 = Math.round(total * 0.15);
  const [tip, setTip] = useState(propina10);
  const [paidWith, setPaidWith] = useState(null);

  const grandTotal = total + tip;
  // Denominaciones sugeridas (billetes de soles por encima del total)
  const denoms = [50, 100, 200].map(d => Math.ceil(grandTotal / d) * d)
    .filter((v, i, a) => a.indexOf(v) === i);
  const denomOpts = [grandTotal, ...denoms.filter(d => d > grandTotal)].slice(0, 4);
  const change = paidWith != null ? paidWith - grandTotal : null;

  useEffect(() => { setPaidWith(null); }, [method, tip, open]);

  const isCash = method === "cash";

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Cobrar cuenta"
      footer={
        <button className="m-btn primary" style={{width:'100%'}} onClick={onComplete}>
          <Icon.check size={15} sw={2.4}/>
          {isCash
            ? ` Confirmar S/ ${grandTotal.toLocaleString("es-PE")} recibidos`
            : ` Confirmar pago · S/ ${grandTotal.toLocaleString("es-PE")}`}
        </button>
      }
    >
      <div className="m-mod-title">Método de pago</div>
      <div className="m-pay-methods">
        <button className={`m-pay-method ${method === 'card' ? 'active' : ''}`} onClick={() => setMethod('card')}>
          <div className="m-pay-method-ico"><Icon.card size={18}/></div>
          <div className="m-pay-method-name">Tarjeta</div>
          <div className="m-pay-method-meta">Crédito o débito</div>
        </button>
        <button className={`m-pay-method ${method === 'cash' ? 'active' : ''}`} onClick={() => setMethod('cash')}>
          <div className="m-pay-method-ico"><Icon.cash size={18}/></div>
          <div className="m-pay-method-name">Efectivo</div>
          <div className="m-pay-method-meta">Verificar recepción</div>
        </button>
        <button className={`m-pay-method ${method === 'qr' ? 'active' : ''}`} onClick={() => setMethod('qr')}>
          <div className="m-pay-method-ico"><Icon.qr size={18}/></div>
          <div className="m-pay-method-name">Yape / QR</div>
          <div className="m-pay-method-meta">Yape · Plin</div>
        </button>
        <button className={`m-pay-method ${method === 'split' ? 'active' : ''}`} onClick={() => setMethod('split')}>
          <div className="m-pay-method-ico"><Icon.split size={18}/></div>
          <div className="m-pay-method-name">Mixto</div>
          <div className="m-pay-method-meta">2+ métodos</div>
        </button>
      </div>

      <div className="m-mod-title">Propina</div>
      <div className="m-mod-options" style={{marginBottom:14}}>
        {[
          { lbl: "10%", val: propina10 },
          { lbl: "15%", val: propina15 },
          { lbl: "20%", val: Math.round(total * 0.20) },
          { lbl: "Otra", val: -1 },
        ].map(o => (
          <button key={o.lbl} className={`m-mod-chip ${tip === o.val ? 'active' : ''}`} onClick={() => o.val >= 0 && setTip(o.val)}>
            {o.lbl}{o.val > 0 && ` · S/ ${o.val}`}
          </button>
        ))}
      </div>

      {isCash && (
        <div className="m-cash-verify">
          <div className="m-cash-verify-head">
            <Icon.cash size={15}/>
            <span>¿Con cuánto paga el cliente?</span>
          </div>
          <div className="m-cash-denoms">
            {denomOpts.map((d, i) => (
              <button key={d + '-' + i}
                      className={`m-cash-denom ${paidWith === d ? 'active' : ''}`}
                      onClick={() => setPaidWith(d)}>
                {d === grandTotal ? "Justo" : `S/ ${d}`}
              </button>
            ))}
          </div>
          {change != null && (
            <div className="m-cash-change">
              <span>Cambio a entregar</span>
              <span className="v">S/ {change.toLocaleString("es-PE")}</span>
            </div>
          )}
        </div>
      )}

      <div className="m-pay-summary">
        <div className="m-bill-line"><span>Subtotal</span><span>S/ {total.toLocaleString("es-PE")}.00</span></div>
        <div className="m-bill-line"><span>Propina</span><span>S/ {tip.toLocaleString("es-PE")}.00</span></div>
        <div className="m-bill-total">
          <span className="lbl">Total a cobrar</span>
          <span className="val">S/ {grandTotal.toLocaleString("es-PE")}<span style={{fontSize:14, opacity:0.55}}>.00</span></span>
        </div>
      </div>
    </Sheet>
  );
}

/* ---------- Sheet: modificadores al agregar ---------- */
function ModSheet({ open, onClose, dish, onConfirm }) {
  const [qty, setQty] = useState(1);
  const [temp, setTemp] = useState(null);
  const [side, setSide] = useState(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) { setQty(1); setTemp(null); setSide(null); setNote(""); }
  }, [open, dish]);

  if (!dish) return null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={dish.name}
      footer={
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div className="m-dish-qty" style={{background:'var(--m-bg-2)', color:'var(--m-ink)'}}>
            <button onClick={() => setQty(Math.max(1, qty-1))} style={{color:'var(--m-ink)'}}><Icon.minus size={14} sw={2.6}/></button>
            <span className="v" style={{color:'var(--m-ink)'}}>{qty}</span>
            <button onClick={() => setQty(qty+1)} style={{color:'var(--m-ink)'}}><Icon.plus size={14} sw={2.6}/></button>
          </div>
          <button className="m-btn primary" style={{flex:1}} onClick={() => onConfirm(qty, { temp, side, note })}>
            Agregar · S/ {(dish.price * qty).toLocaleString("es-PE")}
          </button>
        </div>
      }
    >
      <p style={{fontSize:13, color:'var(--m-ink-3)', margin:'0 0 6px', lineHeight:1.45}}>
        {dish.desc}
      </p>

      <div className="m-mod-section">
        <div className="m-mod-title">Término · cocción</div>
        <div className="m-mod-options">
          {["Rojo", "Medio", "3/4", "Bien cocido"].map(t => (
            <button key={t} className={`m-mod-chip ${temp === t ? 'active' : ''}`} onClick={() => setTemp(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="m-mod-section">
        <div className="m-mod-title">Acompañamiento</div>
        <div className="m-mod-options">
          {["Arroz", "Papas fritas", "Ensalada criolla", "Frejol", "Doble guarnición (+S/ 8)"].map(s => (
            <button key={s} className={`m-mod-chip ${side === s ? 'active' : ''}`} onClick={() => setSide(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="m-mod-section">
        <div className="m-mod-title">Nota para cocina</div>
        <textarea
          className="m-mod-textarea"
          placeholder="Ej: sin cebolla, alergia a nuez, servir al final…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>
    </Sheet>
  );
}

/* ---------- App root con device frame ---------- */
function MeseroApp() {
  const [view, setView] = useState("mesas"); // mesas | detail | add
  const [, setMesaId] = useState(null);
  const mesas = window.MESAS_DATA;

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'center',
      minHeight:'100vh', padding:'24px',
      background: 'radial-gradient(ellipse at top, #FBF6EC, #F2E9D8)',
    }}>
      <IOSDevice width={402} height={844}>
        <div className="mesero" data-screen-label={
          view === "mesas" ? "01 Mesas" : view === "detail" ? "02 Detalle" : "03 Agregar"
        }>
          {view === "mesas" && (
            <MesasView mesas={mesas} onOpen={(id) => { setMesaId(id); setView("detail"); }}/>
          )}
          {view === "detail" && (
            <MesaDetail
              onBack={() => setView("mesas")}
              onAdd={() => setView("add")}
            />
          )}
          {view === "add" && (
            <AddDishes
              onBack={() => setView("detail")}
              onSend={() => setView("detail")}
            />
          )}
        </div>
      </IOSDevice>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<MeseroApp/>);
