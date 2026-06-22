/* Datos de demostración para la app de mesero UTTOF (Lima, Perú · soles S/) */

const MESAS_DATA = [
  {
    id: 4,
    zone: "Terraza",
    status: "ocupada",
    seats: 4,
    occupied: 4,
    openedAt: "13:42",
    elapsedMin: 28,
    total: 168,
    course: "Plato fuerte",
    alert: 1,
    items: 9,
    progressLabel: "Esperando entrada",
  },
  {
    id: 7,
    zone: "Terraza",
    status: "lista",
    seats: 2,
    occupied: 2,
    openedAt: "13:55",
    elapsedMin: 15,
    total: 68,
    course: "Bebidas",
    alert: 0,
    items: 4,
    progressLabel: "Plato listo en pase",
  },
  {
    id: 12,
    zone: "Salón",
    status: "ocupada",
    seats: 6,
    occupied: 5,
    openedAt: "13:20",
    elapsedMin: 50,
    total: 312,
    course: "Postre",
    alert: 0,
    items: 18,
    progressLabel: "Listo para cuenta",
  },
  {
    id: 14,
    zone: "Salón",
    status: "libre",
    seats: 4,
    occupied: 0,
    total: 0,
    items: 0,
  },
  {
    id: 18,
    zone: "Barra",
    status: "ocupada",
    seats: 2,
    occupied: 2,
    openedAt: "14:05",
    elapsedMin: 5,
    total: 58,
    course: "Aperitivo",
    alert: 0,
    items: 3,
    progressLabel: "Recién sentados",
  },
  {
    id: 21,
    zone: "Salón",
    status: "libre",
    seats: 4,
    occupied: 0,
    total: 0,
    items: 0,
  },
];

const ORDEN_MESA_4 = [
  { id: 1, qty: 2, name: "Ceviche clásico", note: "Sin ají para 1", price: 35, status: "delivered", course: "Entrada" },
  { id: 2, qty: 1, name: "Causa limeña de pollo", price: 24, status: "delivered", course: "Entrada" },
  { id: 3, qty: 2, name: "Lomo saltado", note: "Término medio • 1 sin cebolla", price: 42, status: "cooking", course: "Plato fuerte" },
  { id: 4, qty: 1, name: "Arroz con mariscos", price: 48, status: "ready", course: "Plato fuerte" },
  { id: 5, qty: 4, name: "Pisco sour", note: "Bien helados", price: 24, status: "delivered", course: "Bebidas" },
  { id: 6, qty: 2, name: "Chicha morada", price: 10, status: "delivered", course: "Bebidas" },
];

const MENU_DATA = {
  "Entradas": [
    { id: "e1", name: "Ceviche clásico", desc: "Pescado fresco, leche de tigre, cebolla, camote, choclo", price: 35, time: 12, spice: 2, img: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200" },
    { id: "e2", name: "Causa limeña de pollo", desc: "Papa amarilla, ají, pollo y palta", price: 24, time: 8, spice: 1, img: "https://images.unsplash.com/photo-1611250282006-4484dd3fba6b?w=200" },
    { id: "e3", name: "Papa a la huancaína", desc: "Papa sancochada, crema de ají amarillo y queso", price: 18, time: 6, spice: 1, img: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200" },
    { id: "e4", name: "Tiradito de pescado", desc: "Láminas de pescado en leche de tigre de ají amarillo", price: 32, time: 10, spice: 2, img: "https://images.unsplash.com/photo-1535400875775-0ad9c97a9d61?w=200" },
  ],
  "Plato fuerte": [
    { id: "p1", name: "Lomo saltado", desc: "Lomo al wok con cebolla, tomate, papas y arroz", price: 42, time: 18, spice: 1, img: "https://images.unsplash.com/photo-1558030006-450675393462?w=200" },
    { id: "p2", name: "Arroz con mariscos", desc: "Arroz salteado con mariscos, ají panca y culantro", price: 48, time: 20, spice: 1, img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200" },
    { id: "p3", name: "Ají de gallina", desc: "Pollo en crema de ají amarillo, nueces y pan", price: 34, time: 16, spice: 1, img: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=200" },
  ],
  "Postres": [
    { id: "d1", name: "Suspiro a la limeña", desc: "Manjar blanco con merengue al oporto y canela", price: 18, time: 6, spice: 0, img: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200" },
    { id: "d2", name: "Picarones", desc: "Buñuelos de zapallo y camote con miel de chancaca", price: 16, time: 8, spice: 0, img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200" },
  ],
  "Bebidas": [
    { id: "b1", name: "Chicha morada", desc: "Refresco de maíz morado con piña y especias", price: 10, time: 3, spice: 0, img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=200" },
    { id: "b2", name: "Inca Kola", desc: "La gaseosa peruana, bien helada", price: 8, time: 1, spice: 0, img: "https://images.unsplash.com/photo-1582106245687-cbb466a9f07f?w=200" },
  ],
  "Tragos": [
    { id: "t1", name: "Pisco sour", desc: "Pisco, limón, jarabe y clara de huevo", price: 24, time: 5, spice: 0, img: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200" },
    { id: "t2", name: "Maracuyá sour", desc: "Versión frutal con pulpa fresca de maracuyá", price: 26, time: 5, spice: 0, img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200" },
  ],
};

window.MESAS_DATA = MESAS_DATA;
window.ORDEN_MESA_4 = ORDEN_MESA_4;
window.MENU_DATA = MENU_DATA;
