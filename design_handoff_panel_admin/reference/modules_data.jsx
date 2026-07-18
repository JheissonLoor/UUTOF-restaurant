// Data for mesas, empleados, reportes — UTTOF (Lima, Perú · soles S/)

window.MESAS_DATA = [
  // zone: "salon" | "terraza" | "privado"
  { n: 1,  cap: 4, shape: "round",  zone: "salon",   x: 80,  y: 60,  status: "occupied", guests: 4, time: "32m", ticket: 168, server: "María P.", orderStart: "19:48" },
  { n: 2,  cap: 2, shape: "square", zone: "salon",   x: 200, y: 60,  status: "free" },
  { n: 3,  cap: 6, shape: "round",  zone: "salon",   x: 320, y: 60,  status: "occupied", guests: 2, time: "1h 12m", ticket: 124, server: "Carlos R.", orderStart: "19:08" },
  { n: 4,  cap: 6, shape: "square", zone: "salon",   x: 450, y: 60,  status: "reserved", guests: 6, time: "19:30", holder: "Fam. Ruiz" },
  { n: 5,  cap: 4, shape: "round",  zone: "salon",   x: 80,  y: 200, status: "occupied", guests: 3, time: "08m", ticket: 58, server: "Juan L.", orderStart: "20:12" },
  { n: 6,  cap: 2, shape: "square", zone: "salon",   x: 200, y: 200, status: "cleaning" },
  { n: 7,  cap: 4, shape: "round",  zone: "salon",   x: 320, y: 200, status: "occupied", guests: 2, time: "45m", ticket: 96, server: "María P.", orderStart: "19:35" },
  { n: 8,  cap: 4, shape: "square", zone: "salon",   x: 450, y: 200, status: "free" },
  // Terraza
  { n: 9,  cap: 6, shape: "round",  zone: "terraza", x: 100, y: 360, status: "occupied", guests: 5, time: "24m", ticket: 142, server: "Ana N.", orderStart: "19:56" },
  { n: 10, cap: 4, shape: "round",  zone: "terraza", x: 240, y: 360, status: "reserved", guests: 4, time: "20:00", holder: "J. Mendoza" },
  { n: 11, cap: 8, shape: "square", zone: "terraza", x: 380, y: 360, status: "occupied", guests: 7, time: "1h 38m", ticket: 214, server: "Carlos R.", orderStart: "18:42" },
  { n: 12, cap: 4, shape: "round",  zone: "privado", x: 620, y: 180, status: "occupied", guests: 4, time: "15m", ticket: 88, server: "Ana N.", orderStart: "20:05" },
];

window.EMPLEADOS_DATA = [
  { id: 1,  name: "Roberto Castillo", role: "admin",       email: "roberto@uttof.pe",  phone: "+51 987 654 321", active: true,  shifts: 22, hired: "Mar 2023" },
  { id: 2,  name: "María Pérez",      role: "verificador", email: "maria.p@uttof.pe",  phone: "+51 987 234 567", active: true,  shifts: 18, hired: "Ago 2023" },
  { id: 3,  name: "Carlos Ruiz",      role: "verificador", email: "carlos.r@uttof.pe", phone: "+51 987 345 678", active: true,  shifts: 19, hired: "Ene 2024" },
  { id: 4,  name: "Juan López",       role: "verificador", email: "juan.l@uttof.pe",   phone: "+51 987 456 789", active: true,  shifts: 14, hired: "May 2024" },
  { id: 5,  name: "Ana Navarro",      role: "verificador", email: "ana.n@uttof.pe",    phone: "+51 987 567 890", active: true,  shifts: 16, hired: "Sep 2024" },
  { id: 6,  name: "Luis Herrera",     role: "cocina",      email: "luis.h@uttof.pe",   phone: "+51 987 678 901", active: true,  shifts: 20, hired: "Feb 2023", title: "Chef ejecutivo" },
  { id: 7,  name: "Sofía Mendoza",    role: "cocina",      email: "sofia.m@uttof.pe",  phone: "+51 987 789 012", active: true,  shifts: 18, hired: "Jun 2023", title: "Sous chef" },
  { id: 8,  name: "Pedro Jiménez",    role: "cocina",      email: "pedro.j@uttof.pe",  phone: "+51 987 890 123", active: true,  shifts: 17, hired: "Oct 2023" },
  { id: 9,  name: "Rosa Aguilar",     role: "cocina",      email: "rosa.a@uttof.pe",   phone: "+51 987 901 234", active: false, shifts: 0,  hired: "Ene 2025" },
  { id: 10, name: "Diego Salazar",    role: "cliente",     email: "diego.s@gmail.com", phone: "+51 999 112 233", active: true,  shifts: 0,  hired: "Ene 2025", title: "Frecuente · 23 visitas" },
  { id: 11, name: "Valeria Torres",   role: "cliente",     email: "valeria.t@gmail.com", phone: "+51 999 223 344", active: true,  shifts: 0,  hired: "Feb 2025", title: "Frecuente · 11 visitas" },
  { id: 12, name: "Miguel Ángel Ortiz", role: "cliente",   email: "mortiz@gmail.com",  phone: "+51 999 334 455", active: true,  shifts: 0,  hired: "Mar 2025", title: "8 visitas" },
];

window.REPORTES_DATA = {
  ventasMes: 98420,
  ventasMesAnterior: 86180,
  ticketsMes: 2314,
  clientesUnicos: 1682,
  tasaCancelacion: 3.2,
  // Ventas día x 30 (soles)
  ventasDia: Array.from({ length: 30 }, (_, i) => {
    const wk = i % 7;
    const base = wk === 5 || wk === 6 ? 4400 : 2800;
    return Math.round(base + Math.sin(i * 0.3) * 800 + Math.random() * 700);
  }),
  topProductosMes: [
    { name: "Ceviche Clásico",     cat: "Entrada",      sold: 412, rev: 14420 },
    { name: "Lomo Saltado",        cat: "Plato Fuerte", sold: 386, rev: 16212 },
    { name: "Suspiro a la Limeña", cat: "Postre",       sold: 254, rev: 4572 },
    { name: "Ají de Gallina",      cat: "Plato Fuerte", sold: 228, rev: 7752 },
    { name: "Arroz con Mariscos",  cat: "Plato Fuerte", sold: 176, rev: 8448 },
    { name: "Chicha Morada",       cat: "Bebida",       sold: 445, rev: 4450 },
    { name: "Pisco Sour",          cat: "Bebida",       sold: 189, rev: 4536 },
  ],
  ingresosPorPago: [
    { method: "Tarjeta",   amount: 44280, pct: 45.0, color: "var(--sky-500)" },
    { method: "Yape",      amount: 27560, pct: 28.0, color: "var(--terracotta-500)" },
    { method: "Efectivo",  amount: 19680, pct: 20.0, color: "var(--sage-500)" },
    { method: "Plin",      amount: 6900,  pct: 7.0,  color: "var(--saffron-500)" },
  ],
  cancelacion: { total: 74, porMotivo: [
    { reason: "Cliente canceló",   count: 28, color: "var(--ink-400)" },
    { reason: "Error de pedido",   count: 18, color: "var(--saffron-500)" },
    { reason: "Producto agotado",  count: 16, color: "var(--wine-500)" },
    { reason: "Tiempo excedido",   count: 12, color: "var(--terracotta-500)" },
  ]},
};

window.RESERVAS_DATA = [
  // Hoy
  { id: "RV-2089", name: "Familia Ruiz", phone: "+51 987 654 321", email: "ruiz.fam@gmail.com",
    date: "2026-05-26", time: "13:30", duration: 90, people: 6, mesa: 4, zone: "salon",
    status: "confirmed", source: "App", notes: "Cumpleaños del abuelo, traer postre con vela", vip: true },
  { id: "RV-2090", name: "Jorge Mendoza", phone: "+51 987 876 543", email: "jmendoza@outlook.com",
    date: "2026-05-26", time: "14:00", duration: 75, people: 4, mesa: 10, zone: "terraza",
    status: "confirmed", source: "Web", notes: "" },
  { id: "RV-2091", name: "Sofía Aguilar", phone: "+51 987 445 667", email: "sofi.a@gmail.com",
    date: "2026-05-26", time: "14:30", duration: 60, people: 2, mesa: 2, zone: "salon",
    status: "pending", source: "Teléfono", notes: "Sin gluten en la mesa" },
  { id: "RV-2092", name: "Luis Cárdenas", phone: "+51 987 223 445", email: "lcardenas@gmail.com",
    date: "2026-05-26", time: "15:00", duration: 90, people: 4, mesa: 8, zone: "salon",
    status: "seated", source: "App", notes: "", arrived: "14:58" },
  { id: "RV-2093", name: "Andrea Pacheco", phone: "+51 987 998 776", email: "apacheco@gmail.com",
    date: "2026-05-26", time: "20:00", duration: 120, people: 8, mesa: 11, zone: "terraza",
    status: "confirmed", source: "App", notes: "Aniversario, decorar mesa" , vip: true},
  { id: "RV-2094", name: "Daniela Torres", phone: "+51 987 556 778", email: "dtorres@gmail.com",
    date: "2026-05-26", time: "20:30", duration: 90, people: 3, mesa: null, zone: "salon",
    status: "waitlist", source: "App", notes: "Lista de espera, avisar en cuanto se libere" },
  { id: "RV-2095", name: "Carlos Vega", phone: "+51 987 332 110", email: "cvega@gmail.com",
    date: "2026-05-26", time: "21:00", duration: 75, people: 2, mesa: 6, zone: "salon",
    status: "confirmed", source: "Web", notes: "" },
  { id: "RV-2088", name: "Patricia Solís", phone: "+51 987 778 990", email: "psolis@gmail.com",
    date: "2026-05-26", time: "13:00", duration: 60, people: 2, mesa: 7, zone: "salon",
    status: "no-show", source: "App", notes: "" },
];

window.CONFIG_DATA = {
  restaurante: {
    nombre: "UTTOF",
    razon: "UTTOF S.A.C.",
    rfc: "RUC 20512345678",
    direccion: "Av. La Mar 1234, Miraflores, Lima",
    telefono: "+51 1 555 1234",
    email: "contacto@uttof.pe",
    capacidad: 48,
  },
  horarios: [
    { day: "Lunes",     open: "13:00", close: "23:00", closed: false },
    { day: "Martes",    open: "13:00", close: "23:00", closed: false },
    { day: "Miércoles", open: "13:00", close: "23:00", closed: false },
    { day: "Jueves",    open: "13:00", close: "23:30", closed: false },
    { day: "Viernes",   open: "13:00", close: "01:00", closed: false },
    { day: "Sábado",    open: "12:00", close: "01:00", closed: false },
    { day: "Domingo",   open: "12:00", close: "22:00", closed: false },
  ],
  pagos: [
    { id: "card",     name: "Tarjetas (crédito/débito)", sub: "Visa · Mastercard · Amex", on: true,  icon: "IconCreditCard", bg: "var(--sky-100)", color: "var(--sky-500)" },
    { id: "yape",     name: "Yape",                      sub: "Pago con QR / celular",     on: true,  icon: "IconReceipt",    bg: "var(--terracotta-100)", color: "var(--terracotta-500)" },
    { id: "cash",     name: "Efectivo",                  sub: "Soles peruanos (PEN)",      on: true,  icon: "IconCash",       bg: "var(--sage-100)", color: "var(--sage-500)" },
    { id: "plin",     name: "Plin",                      sub: "Transferencia interbancaria", on: true, icon: "IconPackage",   bg: "var(--saffron-100)", color: "var(--saffron-500)" },
    { id: "digital",  name: "Wallets digitales",         sub: "Mercado Pago · PagoEfectivo", on: false, icon: "IconCreditCard", bg: "var(--cream-200)", color: "var(--ink-500)" },
  ],
  reservas: { anticipacionMax: 30, anticipacionMin: 2, duracionDefault: 90 },
  notificaciones: [
    { id: "new_order",    title: "Nuevo pedido",          sub: "Cuando llega un pedido nuevo a cocina",  channels: { app: true, email: false, sms: false } },
    { id: "order_ready",  title: "Pedido listo",          sub: "Cuando cocina termina un pedido",        channels: { app: true, email: false, sms: false } },
    { id: "payment",      title: "Pago recibido",         sub: "Confirmación de pago completado",        channels: { app: true, email: true,  sms: false } },
    { id: "low_stock",    title: "Stock bajo",            sub: "Alerta cuando un insumo escasea",        channels: { app: true, email: true,  sms: false } },
    { id: "reservation",  title: "Nueva reservación",     sub: "Reservas recibidas en línea",            channels: { app: true, email: true,  sms: true  } },
    { id: "review",       title: "Nueva reseña",          sub: "Cuando un cliente deja reseña",          channels: { app: true, email: false, sms: false } },
    { id: "cancelation",  title: "Cancelación",           sub: "Cuando se cancela un pedido o reserva",  channels: { app: true, email: true,  sms: false } },
  ],
};
