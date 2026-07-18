// Icons — inline SVG React components. Stroke-based, 1.6px, warm feel.
const Icon = ({ size = 18, children, fill = "none", strokeWidth = 1.75, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor"
       strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {children}
  </svg>
);

const IconChef = (p) => <Icon {...p}>
  <path d="M6 14v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5"/>
  <path d="M6 14a4 4 0 0 1-2-7.5A4.5 4.5 0 0 1 12 4a4.5 4.5 0 0 1 8 2.5A4 4 0 0 1 18 14Z"/>
  <path d="M9 21v-7M15 21v-7M12 21v-7"/>
</Icon>;

const IconDashboard = (p) => <Icon {...p}>
  <rect x="3" y="3" width="7" height="9" rx="1.5"/>
  <rect x="14" y="3" width="7" height="5" rx="1.5"/>
  <rect x="14" y="12" width="7" height="9" rx="1.5"/>
  <rect x="3" y="16" width="7" height="5" rx="1.5"/>
</Icon>;

const IconMenu = (p) => <Icon {...p}>
  <path d="M4 7h16M4 12h16M4 17h10"/>
</Icon>;

const IconUsers = (p) => <Icon {...p}>
  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
  <circle cx="9" cy="7" r="4"/>
  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
</Icon>;

const IconOrders = (p) => <Icon {...p}>
  <path d="M8 2h8l2 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6l2-4Z"/>
  <path d="M4 6h16M9 12h6M9 16h4"/>
</Icon>;

const IconDollar = (p) => <Icon {...p}>
  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
</Icon>;

const IconReceipt = (p) => <Icon {...p}>
  <path d="M4 2v20l2-1.5L8 22l2-1.5L12 22l2-1.5L16 22l2-1.5L20 22V2l-2 1.5L16 2l-2 1.5L12 2l-2 1.5L8 2 6 3.5 4 2Z"/>
  <path d="M8 7h8M8 11h8M8 15h5"/>
</Icon>;

const IconTable = (p) => <Icon {...p}>
  <path d="M3 10h18"/>
  <path d="M5 10v9M19 10v9"/>
  <path d="M4 6c0-1 1-2 2-2h12c1 0 2 1 2 2v4H4V6Z"/>
</Icon>;

const IconTrendUp = (p) => <Icon {...p}>
  <path d="M3 17l6-6 4 4 8-8"/>
  <path d="M14 7h7v7"/>
</Icon>;

const IconArrowUp = (p) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>;
const IconArrowDown = (p) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>;

const IconBell = (p) => <Icon {...p}>
  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
  <path d="M10 21a2 2 0 0 0 4 0"/>
</Icon>;

const IconSearch = (p) => <Icon {...p}>
  <circle cx="11" cy="11" r="7"/>
  <path d="M21 21l-4.3-4.3"/>
</Icon>;

const IconLogOut = (p) => <Icon {...p}>
  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
  <path d="M16 17l5-5-5-5M21 12H9"/>
</Icon>;

const IconSettings = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="3"/>
  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
</Icon>;

const IconClock = (p) => <Icon {...p}>
  <circle cx="12" cy="12" r="10"/>
  <path d="M12 6v6l4 2"/>
</Icon>;

const IconCheck = (p) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>;

const IconX = (p) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12"/></Icon>;

const IconFlame = (p) => <Icon {...p}>
  <path d="M8.5 14.5c0-4 3.5-3.5 3.5-8 2 2.5 5 5 5 9a5 5 0 0 1-10 0 4 4 0 0 1 1.5-3Z"/>
</Icon>;

const IconStar = (p) => <Icon {...p}>
  <path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7Z"/>
</Icon>;

const IconCreditCard = (p) => <Icon {...p}>
  <rect x="2" y="5" width="20" height="14" rx="2"/>
  <path d="M2 10h20M6 15h4"/>
</Icon>;

const IconCash = (p) => <Icon {...p}>
  <rect x="2" y="6" width="20" height="12" rx="2"/>
  <circle cx="12" cy="12" r="3"/>
  <path d="M6 10v.01M18 14v.01"/>
</Icon>;

const IconCalendar = (p) => <Icon {...p}>
  <rect x="3" y="4" width="18" height="17" rx="2"/>
  <path d="M3 10h18M8 2v4M16 2v4"/>
</Icon>;

const IconDownload = (p) => <Icon {...p}>
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <path d="M7 10l5 5 5-5M12 15V3"/>
</Icon>;

const IconPlus = (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;

const IconAlertTriangle = (p) => <Icon {...p}>
  <path d="M10.3 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/>
  <path d="M12 9v4M12 17h.01"/>
</Icon>;

const IconPackage = (p) => <Icon {...p}>
  <path d="M16.5 9.4L7.5 4.21"/>
  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/>
  <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
</Icon>;

const IconPhone = (p) => <Icon {...p}>
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>
</Icon>;

const IconMail = (p) => <Icon {...p}>
  <rect x="3" y="5" width="18" height="14" rx="2"/>
  <path d="M3 7l9 7 9-7"/>
</Icon>;

const IconMessage = (p) => <Icon {...p}>
  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/>
</Icon>;

// Build hourly sales sparkline values
const makeSpark = (seed, scale = 1) => {
  const arr = [];
  let v = 40;
  for (let i = 0; i < 24; i++) {
    v += (Math.sin(i * 0.7 + seed) * 12 + (Math.random() - 0.5) * 8) * scale;
    v = Math.max(8, Math.min(92, v));
    arr.push(v);
  }
  return arr;
};

const fmt$ = (n) => n.toLocaleString("es-MX", { maximumFractionDigits: 0 });

Object.assign(window, {
  Icon,
  IconChef, IconDashboard, IconMenu, IconUsers, IconOrders,
  IconDollar, IconReceipt, IconTable, IconTrendUp, IconArrowUp, IconArrowDown,
  IconBell, IconSearch, IconLogOut, IconSettings, IconClock, IconCheck, IconX,
  IconFlame, IconStar, IconCreditCard, IconCash, IconCalendar, IconDownload,
  IconPlus, IconAlertTriangle, IconPackage,
  IconPhone, IconMail, IconMessage,
  makeSpark, fmt$,
});
