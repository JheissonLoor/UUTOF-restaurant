// Dashboard data — realistic restaurant numbers for "Mesa & Sabor"

const DATA = {
  today: {
    ingresos: 18420,
    ingresosAyer: 15680,
    pedidos: 87,
    pedidosAyer: 72,
    mesasOcupadas: 8,
    mesasTotales: 12,
    ticketPromedio: 211.7,
    ticketPromedioAyer: 217.8,
    pedidosPendientes: 4,
  },

  distribucion: [
    { key: "espera",     label: "En Espera",      count: 3,  color: "var(--saffron-500)" },
    { key: "preparacion",label: "En Preparación", count: 6,  color: "var(--terracotta-500)" },
    { key: "terminado",  label: "Terminado",      count: 4,  color: "var(--sky-500)" },
    { key: "faltaPagar", label: "Falta Pagar",    count: 2,  color: "var(--wine-500)" },
    { key: "pagado",     label: "Pagado",         count: 71, color: "var(--sage-500)" },
    { key: "cancelado",  label: "Cancelado",      count: 1,  color: "var(--ink-400)" },
  ],

  // Revenue over last 14 days (PEN)
  revenue14: {
    labels: ["10","11","12","13","14","15","16","17","18","19","20","21","22","hoy"],
    thisWeek: [12800, 11400, 13600, 15200, 18900, 21400, 17200, 14100, 12900, 15600, 16800, 19400, 22100, 18420],
    lastWeek: [11200, 10800, 12100, 13900, 16400, 19800, 15600, 12400, 11800, 13900, 14200, 17800, 19400, 15680],
  },

  topPlatillos: [
    { name: "Lomo saltado",        cat: "Platos de fondo", count: 34, pct: 1.0 },
    { name: "Ají de gallina",      cat: "Platos de fondo", count: 28, pct: 0.82 },
    { name: "Causa limeña",        cat: "Entradas",        count: 21, pct: 0.62 },
    { name: "Arroz con mariscos",  cat: "Platos de fondo", count: 19, pct: 0.56 },
    { name: "Anticuchos",          cat: "Entradas",        count: 15, pct: 0.44 },
    { name: "Suspiro a la limeña", cat: "Postres",         count: 12, pct: 0.35 },
  ],

  mesas: [
    { n: 1,  status: "occupied", guests: 4, time: "32m", ticket: 540 },
    { n: 2,  status: "free" },
    { n: 3,  status: "occupied", guests: 2, time: "1h 12m", ticket: 820 },
    { n: 4,  status: "reserved", guests: 6, time: "19:30" },
    { n: 5,  status: "occupied", guests: 3, time: "08m", ticket: 180 },
    { n: 6,  status: "cleaning" },
    { n: 7,  status: "occupied", guests: 2, time: "45m", ticket: 410 },
    { n: 8,  status: "free" },
    { n: 9,  status: "occupied", guests: 5, time: "24m", ticket: 680 },
    { n: 10, status: "reserved", guests: 4, time: "20:00" },
    { n: 11, status: "occupied", guests: 2, time: "1h 38m", ticket: 960 },
    { n: 12, status: "occupied", guests: 4, time: "15m", ticket: 320 },
  ],

  actividad: [
    { type: "order",  who: "Mesa 5",  what: "nuevo pedido — 3 platillos", when: "hace 2 min", actor: "MP" },
    { type: "pay",    who: "Mesa 3",  what: "pagó S/ 820 con tarjeta",     when: "hace 4 min", actor: "CR" },
    { type: "ready",  who: "Cocina",  what: "terminó pedido #0124",         when: "hace 7 min", actor: "JL" },
    { type: "reserve",who: "Reserva", what: "Familia Ruiz — 6 personas · 19:30", when: "hace 12 min", actor: "AN" },
    { type: "review", who: "Reseña",  what: "Sofía dejó una reseña ★★★★★", when: "hace 18 min", actor: "SF" },
    { type: "order",  who: "Mesa 12", what: "nuevo pedido — 2 platillos",   when: "hace 22 min", actor: "MP" },
  ],

  alertas: [
    { level: "urgent", title: "Mesa 11 lleva 1h 38m sin actualizarse", sub: "Considera revisar el estado del pedido" },
    { level: "warn",   title: "Stock bajo: Palta (3 kg restantes)", sub: "Rendimiento aprox. 4 horas" },
    { level: "warn",   title: "2 pedidos con falta de pago > 30 min",  sub: "Mesas 5 y 9" },
  ],

  pagos: [
    { name: "Pagos Online",    sub: "Tarjeta · transferencia", amount: 10240, pct: 56, color: "var(--sky-500)", bg: "var(--sky-100)" },
    { name: "Pagos en Efectivo", sub: "42 transacciones",      amount: 6180,  pct: 34, color: "var(--sage-500)", bg: "var(--sage-100)" },
    { name: "Reservaciones",   sub: "Anticipos recibidos",     amount: 2000,  pct: 10, color: "var(--saffron-500)", bg: "var(--saffron-100)" },
  ],

  // 7 days × 24h heatmap: orders per hour
  heatmap: (() => {
    const rows = [];
    // weight: lunch (13-15), dinner (20-22); weekends stronger
    for (let d = 0; d < 7; d++) {
      const weekend = d >= 4;
      const row = [];
      for (let h = 0; h < 24; h++) {
        let v = 0;
        if (h >= 13 && h <= 15) v = (weekend ? 14 : 10) + Math.round(Math.random() * 4);
        else if (h >= 19 && h <= 22) v = (weekend ? 18 : 12) + Math.round(Math.random() * 6);
        else if (h >= 11 && h <= 12) v = 3 + Math.round(Math.random() * 3);
        else if (h >= 16 && h <= 18) v = 4 + Math.round(Math.random() * 3);
        else if (h >= 9 && h <= 10)  v = 1 + Math.round(Math.random() * 2);
        else v = 0;
        row.push(v);
      }
      rows.push(row);
    }
    return rows;
  })(),
};

window.DATA = DATA;
