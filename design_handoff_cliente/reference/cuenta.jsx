// UTTOF — Cuenta & Recibo (pantallas finales del flujo postpago)
// Se abren después del tracking, cuando el pedido fue servido.

const { useState: useCuS, useEffect: useCuE } = React;

// ---- Métodos de pago disponibles ----
const C_PAY_METHODS = [
  {
    id: "card",
    name: "Tarjeta",
    sub: "Crédito o débito · pago instantáneo desde la app",
    instant: true,
    ico: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="3"/><path d="M2 10h20"/><path d="M6 15h4"/>
      </svg>
    ),
  },
  {
    id: "yape",
    name: "Yape / QR",
    sub: "Escanea con tu app bancaria",
    instant: true,
    ico: <span style={{ fontFamily: "Fraunces, Georgia, serif", fontStyle: "italic", fontWeight: 600, fontSize: 22 }}>Y</span>,
  },
  {
    id: "cash",
    name: "Efectivo",
    sub: "Entrega al mesero al cerrar",
    instant: false,
    verifyByWaiter: true,
    ico: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
];

const C_TIP_OPTIONS = [0, 10, 15, 20];

// ====================== CUENTA ======================
const CCuenta = ({ open, onClose, order, onPaid }) => {
  const [tipPct, setTipPct] = useCuS(15);
  const [methodId, setMethodId] = useCuS("card");
  const [processing, setProcessing] = useCuS(false);

  useCuE(() => {
    if (open) { setTipPct(15); setMethodId("card"); setProcessing(false); }
  }, [open]);

  if (!open || !order) return null;

  const subtotal = order.total || 0;
  const iva = Math.round(subtotal * 0.16 / 1.16);
  const tip = Math.round(subtotal * tipPct / 100);
  const total = subtotal + tip;
  const method = C_PAY_METHODS.find(m => m.id === methodId);
  const items = order.items || [];

  const handlePay = () => {
    setProcessing(true);
    setTimeout(() => {
      const folio = "UTTOF-" + (1000 + Math.floor(Math.random() * 999));
      const auth  = Math.floor(100000 + Math.random() * 899999).toString();
      const fiscal = "a3f8-9c21-bd44-72e5-fb09";
      onPaid({
        ...order,
        folio, auth, fiscal,
        subtotal, iva, tip, tipPct, total,
        method: methodId,
        methodName: method.name,
        verifyByWaiter: !!method.verifyByWaiter,
        paidAt: new Date(),
      });
    }, 1200);
  };

  return (
    <>
      <div className="c-co-back" onClick={onClose}/>
      <div className="c-cu-modal" data-screen-label="07 Pedir cuenta">

        <div className="c-cu-head">
          <button className="c-co-close" onClick={onClose}><CClose size={18}/></button>
          <div>
            <div className="c-cu-eyebrow">Cuenta · UTTOF-1042</div>
            <div className="c-cu-title">Tu cuenta</div>
          </div>
          <span className="c-cu-head-pill"><span className="dot"/> Listo para cobrar</span>
        </div>

        <div className="c-cu-body">

          {/* Mesa card */}
          <div className="c-cu-mesa">
            <div className="c-cu-mesa-avatar">DR</div>
            <div className="c-cu-mesa-info">
              <div className="ebr">Mesa {order.table} · {order.diners} {order.diners === 1 ? "comensal" : "comensales"} · Diego R.</div>
              <div className="name">Cena · Hoy {new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}</div>
              <div className="sub">Pedido <b>UTTOF-1042</b> · servido hace unos minutos</div>
            </div>
            <div className="c-cu-mesa-status">
              <div className="lbl">Subtotal</div>
              <div className="val tnum">${subtotal}</div>
            </div>
          </div>

          {/* Items */}
          <div className="c-cu-sec-h"><h3>Tu consumo</h3></div>
          <div className="c-cu-items">
            {items.length === 0 ? (
              <div className="c-cu-empty">Sin items</div>
            ) : items.map(it => (
              <div key={it.id} className="c-cu-item">
                <span className="qty">×{it.qty}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nm">{it.name}</div>
                </div>
                <span className="pr tnum">${it.price * it.qty}</span>
              </div>
            ))}
          </div>

          {/* Tip */}
          <div className="c-cu-sec-h"><h3>Propina</h3><span className="lnk">Personalizar</span></div>
          <div className="c-cu-tip-card">
            <div className="c-cu-tip-head">
              <span className="lbl">Para Diego R.</span>
              <span className="amt tnum">+ ${tip}</span>
            </div>
            <div className="c-cu-tip-opts">
              {C_TIP_OPTIONS.map(p => (
                <button key={p}
                        className={`c-cu-tip-opt ${tipPct === p ? "active" : ""}`}
                        onClick={() => setTipPct(p)}>
                  {p === 0 ? "Sin" : `${p}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="c-cu-totals">
            <div className="row"><span>Subtotal</span><span className="tnum">${subtotal}</span></div>
            <div className="row muted"><span>IVA incluido</span><span className="tnum">${iva}</span></div>
            <div className="row"><span>Propina ({tipPct}%)</span><span className="tnum">${tip}</span></div>
            <div className="row total"><span>Total</span><span className="tnum">${total}</span></div>
          </div>

          {/* Method */}
          <div className="c-cu-sec-h"><h3>Método de pago</h3></div>
          <div className="c-cu-methods">
            {C_PAY_METHODS.map(m => (
              <button key={m.id}
                      className={`c-cu-method m-${m.id} ${methodId === m.id ? "active" : ""}`}
                      onClick={() => setMethodId(m.id)}>
                <div className="ico">{m.ico}</div>
                <div className="info">
                  <div className="name">{m.name}</div>
                  <div className="sub">{m.sub}</div>
                  {m.verifyByWaiter && (
                    <span className="verif-pill">
                      <CCheck size={9} strokeWidth={3}/> mesero verifica recepción
                    </span>
                  )}
                </div>
                <div className="radio"/>
              </button>
            ))}
          </div>
        </div>

        <div className="c-cu-foot">
          <button className="c-cu-cta" onClick={handlePay} disabled={processing}>
            {processing ? (
              <>
                <span className="c-cu-spinner"/>
                Procesando…
              </>
            ) : methodId === "cash" ? (
              <>Confirmar — pagaré <span className="price tnum">${total}</span> al mesero</>
            ) : (
              <>Pagar <span className="price tnum">${total}</span></>
            )}
          </button>
        </div>

      </div>
    </>
  );
};

// ====================== RECIBO ======================
const CRecibo = ({ open, onClose, receipt }) => {
  if (!open || !receipt) return null;

  const items = receipt.items || [];
  const methodLabels = {
    card: "Tarjeta · VISA •• 3456",
    yape: "Yape · ••• 4821",
    cash: "Efectivo entregado al mesero",
  };
  const methodLabel = methodLabels[receipt.method] || receipt.methodName;
  const verified = receipt.verifyByWaiter;
  const fechaStr = receipt.paidAt
    ? receipt.paidAt.toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  return (
    <>
      <div className="c-co-back" onClick={onClose}/>
      <div className="c-re-modal" data-screen-label="08 Recibo">

        <div className="c-re-success">
          <div className="c-re-check">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>
          <h2 className="c-re-title">
            {verified ? "Cuenta confirmada" : "¡Gracias por venir!"}
          </h2>
          <p className="c-re-sub">
            {verified
              ? "Diego R. recibirá tu efectivo. La mesa queda libre al confirmar."
              : "Tu pago se procesó correctamente"}
          </p>
        </div>

        <div className="c-re-body">

          {/* Ticket */}
          <div className="c-re-ticket">
            <div className="c-re-ticket-top">
              <div className="c-re-ticket-logo">M</div>
              <div className="c-re-ticket-brand">
                <h4>Mesa &amp; Sabor</h4>
                <div className="id">{receipt.folio} · {fechaStr}</div>
              </div>
              <span className={`c-re-ticket-status ${verified ? "pending" : ""}`}>
                {verified ? "Por verificar" : "Pagado"}
              </span>
            </div>

            <div className="c-re-ticket-meta">
              <div><div className="k">Mesa</div><div className="v">#{receipt.table} · {receipt.diners} {receipt.diners === 1 ? "persona" : "personas"}</div></div>
              <div><div className="k">Mesero</div><div className="v">Diego R.</div></div>
              <div><div className="k">Folio</div><div className="v">{receipt.folio}</div></div>
              <div><div className="k">Autorización</div><div className="v">{receipt.auth}</div></div>
            </div>

            <div className="c-re-ticket-divider"/>

            <div className="c-re-ticket-items">
              {items.map(it => (
                <div key={it.id} className="ti">
                  <span className="nm"><small>×{it.qty}</small>{it.name}</span>
                  <span className="pr tnum">${it.price * it.qty}</span>
                </div>
              ))}
            </div>

            <div className="c-re-ticket-totals">
              <div className="ti"><span>Subtotal</span><span className="tnum">${receipt.subtotal}</span></div>
              <div className="ti"><span>IVA incluido (16%)</span><span className="tnum">${receipt.iva}</span></div>
              <div className="ti"><span>Propina ({receipt.tipPct}%)</span><span className="tnum">${receipt.tip}</span></div>
              <div className="ti total"><span>{verified ? "Total a entregar" : "Total cobrado"}</span><span className="tnum">${receipt.total}</span></div>
            </div>

            <div className="c-re-ticket-method">
              <div className="mi">
                {C_PAY_METHODS.find(m => m.id === receipt.method)?.ico}
              </div>
              <div className="mt">
                <div className="lbl">{methodLabel}</div>
                <div className="val">{verified ? "Pendiente · mesero verifica" : `Aut. ${receipt.auth} · ${fechaStr}`}</div>
              </div>
              <div className={`check ${verified ? "pending" : ""}`}>
                {verified
                  ? <CClock size={12}/>
                  : <CCheck size={13} strokeWidth={3.5}/>}
              </div>
            </div>

            <div className="c-re-ticket-qr">
              <div className="qr-box">
                <svg viewBox="0 0 100 100" width="76" height="76">
                  <rect width="100" height="100" fill="#fff"/>
                  <rect x="6" y="6" width="22" height="22" fill="#1F1A14"/>
                  <rect x="11" y="11" width="12" height="12" fill="#fff"/>
                  <rect x="14" y="14" width="6" height="6" fill="#1F1A14"/>
                  <rect x="72" y="6" width="22" height="22" fill="#1F1A14"/>
                  <rect x="77" y="11" width="12" height="12" fill="#fff"/>
                  <rect x="80" y="14" width="6" height="6" fill="#1F1A14"/>
                  <rect x="6" y="72" width="22" height="22" fill="#1F1A14"/>
                  <rect x="11" y="77" width="12" height="12" fill="#fff"/>
                  <rect x="14" y="80" width="6" height="6" fill="#1F1A14"/>
                  {Array.from({ length: 11 }).map((_, r) =>
                    Array.from({ length: 11 }).map((_, c) => {
                      const seed = (r * 13 + c * 23 + r * c * 5) % 100;
                      if (seed < 48 && !(r < 4 && c < 4) && !(r < 4 && c > 7) && !(r > 7 && c < 4)) {
                        return <rect key={`${r}-${c}`} x={r * 8 + 6} y={c * 8 + 6} width="6" height="6" fill="#1F1A14"/>;
                      }
                      return null;
                    })
                  )}
                </svg>
              </div>
              <div className="qt">
                <div className="lbl">Validar recibo</div>
                <div className="v">Folio fiscal</div>
                <div className="h">{receipt.fiscal}</div>
              </div>
            </div>
          </div>

          {/* Rating */}
          {!verified && (
            <button className="c-re-rate">
              <div className="text">
                <h5>¿Cómo estuvo tu visita?</h5>
                <p>Tu reseña ayuda a Diego R. y al equipo</p>
                <div className="stars">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} viewBox="0 0 24 24" fill={i <= 4 ? "currentColor" : "none"}
                         stroke="currentColor" strokeWidth="1.6">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  ))}
                </div>
              </div>
              <div className="arrow">
                <CArrow size={16}/>
              </div>
            </button>
          )}

          <div className="c-re-actions">
            <button className="c-re-action">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Enviar por correo
            </button>
            <button className="c-re-action">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Guardar PDF
            </button>
          </div>
        </div>

        <div className="c-re-foot">
          <button className="c-re-cta" onClick={onClose}>
            Volver al inicio
          </button>
        </div>

      </div>
    </>
  );
};

// Exponer al scope global para que cliente.jsx las pueda usar
window.CCuenta = CCuenta;
window.CRecibo = CRecibo;
