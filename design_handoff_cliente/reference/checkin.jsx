// UTTOF — Cliente · Flujo de entrada walk-in (escanear QR de mesa → check-in)
// Se muestra antes de la app cuando el cliente llega sin sesión de mesa.

const { useState: useChS } = React;

// ---- Pantalla: Escanear QR de la mesa ----
const CScanQR = ({ onDetected, onManual }) => {
  return (
    <div className="c-scan" data-screen-label="00 Escanear QR mesa">
      <div className="c-scan-cam"></div>

      <div className="c-scan-top">
        <button className="c-scan-x" onClick={onManual} aria-label="Cerrar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div className="c-scan-title">Escanear mesa</div>
        <div className="c-scan-fl">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 7h2l1-2h8l1 2h2a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.2"/></svg>
        </div>
      </div>

      <div className="c-scan-body">
        <button className="c-scan-frame" onClick={onDetected} aria-label="Simular detección del código">
          <span className="c-scan-corner tl"></span><span className="c-scan-corner tr"></span>
          <span className="c-scan-corner bl"></span><span className="c-scan-corner br"></span>
          <span className="c-scan-line"></span>
          <svg className="c-scan-qr" viewBox="0 0 100 100" width="182" height="182">
            <rect width="100" height="100" rx="4" fill="#fff"/>
            <rect x="8" y="8" width="22" height="22" fill="#1F1A14"/><rect x="13" y="13" width="12" height="12" fill="#fff"/><rect x="16" y="16" width="6" height="6" fill="#1F1A14"/>
            <rect x="70" y="8" width="22" height="22" fill="#1F1A14"/><rect x="75" y="13" width="12" height="12" fill="#fff"/><rect x="78" y="16" width="6" height="6" fill="#1F1A14"/>
            <rect x="8" y="70" width="22" height="22" fill="#1F1A14"/><rect x="13" y="75" width="12" height="12" fill="#fff"/><rect x="16" y="78" width="6" height="6" fill="#1F1A14"/>
            <g fill="#1F1A14">
              <rect x="36" y="10" width="4" height="4"/><rect x="44" y="10" width="4" height="4"/><rect x="56" y="10" width="4" height="4"/><rect x="40" y="16" width="4" height="4"/><rect x="50" y="16" width="4" height="4"/><rect x="60" y="16" width="4" height="4"/><rect x="36" y="22" width="4" height="4"/><rect x="52" y="22" width="4" height="4"/>
              <rect x="10" y="36" width="4" height="4"/><rect x="18" y="36" width="4" height="4"/><rect x="28" y="36" width="4" height="4"/><rect x="40" y="36" width="4" height="4"/><rect x="50" y="36" width="4" height="4"/><rect x="62" y="36" width="4" height="4"/><rect x="72" y="36" width="4" height="4"/><rect x="84" y="36" width="4" height="4"/>
              <rect x="14" y="44" width="4" height="4"/><rect x="24" y="44" width="4" height="4"/><rect x="44" y="44" width="4" height="4"/><rect x="54" y="44" width="4" height="4"/><rect x="66" y="44" width="4" height="4"/><rect x="78" y="44" width="4" height="4"/>
              <rect x="10" y="52" width="4" height="4"/><rect x="34" y="52" width="4" height="4"/><rect x="46" y="52" width="4" height="4"/><rect x="58" y="52" width="4" height="4"/><rect x="72" y="52" width="4" height="4"/><rect x="88" y="52" width="4" height="4"/>
              <rect x="20" y="60" width="4" height="4"/><rect x="40" y="60" width="4" height="4"/><rect x="52" y="60" width="4" height="4"/><rect x="64" y="60" width="4" height="4"/><rect x="84" y="60" width="4" height="4"/>
              <rect x="36" y="70" width="4" height="4"/><rect x="48" y="70" width="4" height="4"/><rect x="60" y="70" width="4" height="4"/><rect x="72" y="70" width="4" height="4"/><rect x="84" y="70" width="4" height="4"/>
              <rect x="40" y="78" width="4" height="4"/><rect x="52" y="78" width="4" height="4"/><rect x="68" y="78" width="4" height="4"/><rect x="80" y="78" width="4" height="4"/><rect x="88" y="78" width="4" height="4"/>
              <rect x="36" y="86" width="4" height="4"/><rect x="48" y="86" width="4" height="4"/><rect x="58" y="86" width="4" height="4"/><rect x="70" y="86" width="4" height="4"/>
            </g>
          </svg>
        </button>
      </div>

      <div className="c-scan-cap">
        <h3>Apunta al código de tu mesa</h3>
        <p>Encuéntralo en el centro de tu mesa. Lo detectamos automáticamente.</p>
      </div>

      <div className="c-scan-foot">
        <button className="c-scan-manual" onClick={onManual}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h.01M11 10h.01M15 10h.01M7 14h6"/></svg>
          Ingresar número de mesa
        </button>
        <div className="c-scan-hint">UTTOF · Av. La Mar 1234, Miraflores</div>
      </div>
    </div>
  );
};

// ---- Pantalla: Confirmación "Estás en la Mesa X" ----
const CCheckin = ({ mesa, onVerMenu, onRescan }) => {
  return (
    <div className="c-checkin" data-screen-label="01 Confirmacion mesa">
      <div className="c-cf-head">
        <div className="c-cf-check">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div className="c-cf-eyebrow">Check-in confirmado</div>
        <h2 className="c-cf-title">Estás en la<br/><em>Mesa {mesa.num}</em></h2>
      </div>

      <div className="c-cf-scroll">
        <div className="c-cf-mesa">
          <div className="c-cf-mesa-grid">
            <div className="it"><div className="k">Zona</div><div className="v" style={{ fontSize: 18 }}>{mesa.zone}</div></div>
            <div className="it"><div className="k">Mesa</div><div className="v">#{mesa.num}</div></div>
            <div className="it"><div className="k">Capacidad</div><div className="v">{mesa.cap} <small>pers.</small></div></div>
          </div>
        </div>

        <div className="c-cf-steps">
          <div className="c-cf-step"><span className="n">1</span><span className="tx">Explora la carta y <b>arma tu pedido</b></span></div>
          <div className="c-cf-step"><span className="n">2</span><span className="tx">Tu orden va <b>directo a cocina</b></span></div>
          <div className="c-cf-step"><span className="n">3</span><span className="tx">Sigue tu pedido <b>en vivo</b></span></div>
          <div className="c-cf-step"><span className="n">4</span><span className="tx">Al final, <b>pides la cuenta</b> y pagas</span></div>
        </div>
      </div>

      <div className="c-cf-foot">
        <button className="c-cf-cta" onClick={onVerMenu}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18M3 12h18M3 17h12"/></svg>
          Ver la carta
        </button>
        <button className="c-cf-ghost" onClick={onRescan}>¿Mesa equivocada? Escanear de nuevo</button>
      </div>
    </div>
  );
};

window.CScanQR = CScanQR;
window.CCheckin = CCheckin;
