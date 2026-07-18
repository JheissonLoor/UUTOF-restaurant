// Empleados module

const { useState: useS2, useMemo: useM2 } = React;

const ROLE_CFG = {
  admin:       { label: "Admin", ico: IconSettings },
  cocina:      { label: "Cocina", ico: IconChef },
  verificador: { label: "Verificador", ico: IconCheck },
  cliente:     { label: "Cliente", ico: IconUsers },
};

const initials = (name) => name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

const EmpleadosStats = () => {
  const total = EMPLEADOS_DATA.length;
  const staff = EMPLEADOS_DATA.filter(e => e.role !== "cliente").length;
  const active = EMPLEADOS_DATA.filter(e => e.active && e.role !== "cliente").length;
  const clientes = EMPLEADOS_DATA.filter(e => e.role === "cliente").length;
  const items = [
    { label: "Usuarios totales", value: total,    sub: "Todos los roles",        bg: "var(--cream-200)",    color: "var(--ink-700)",    ico: IconUsers },
    { label: "Personal activo",  value: active,   sub: `de ${staff} empleados`, bg: "var(--sage-100)",     color: "var(--sage-500)",   ico: IconCheck },
    { label: "Clientes registrados", value: clientes, sub: "Con cuenta en la app", bg: "var(--sky-100)",    color: "var(--sky-500)",    ico: IconUsers },
    { label: "Invitaciones",     value: 3,        sub: "Pendientes de aceptar", bg: "var(--saffron-100)",  color: "var(--saffron-500)",ico: IconBell },
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
              <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 2 }}>{s.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EmpleadoCard = ({ emp }) => {
  const cfg = ROLE_CFG[emp.role];
  const Ico = cfg.ico;
  return (
    <div className="emp-card">
      <div className="emp-head">
        <div className={`emp-avatar ${emp.role}`}>{initials(emp.name)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div className="emp-name">{emp.name}</div>
            <span className={`status-indicator ${emp.active ? "" : "inactive"}`} title={emp.active ? "Activo" : "Inactivo"}/>
          </div>
          <span className={`emp-role ${emp.role}`}>
            <Ico size={10} strokeWidth={2.5}/> {cfg.label}
          </span>
          {emp.title && (
            <div style={{ fontSize: 11.5, color: "var(--ink-500)", marginTop: 6, fontStyle: "italic" }}>{emp.title}</div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12.5, color: "var(--ink-500)", display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconReceipt size={12}/> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{emp.email}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconBell size={12}/> <span>{emp.phone}</span>
        </div>
      </div>
      <div className="emp-info-row">
        <div>Contratado · <b>{emp.hired}</b></div>
        {emp.role !== "cliente" && <div><b>{emp.shifts}</b> turnos/mes</div>}
      </div>
      <div className="emp-actions">
        <button><IconSettings size={13}/> Editar</button>
        <button><IconX size={13}/> {emp.active ? "Desactivar" : "Activar"}</button>
        <button><IconLogOut size={13}/> Reset pass</button>
      </div>
    </div>
  );
};

const EmpleadosPage = () => {
  const [role, setRole] = useS2("all");
  const [q, setQ] = useS2("");

  const filtered = useM2(() => {
    return EMPLEADOS_DATA.filter(e => {
      if (role !== "all" && e.role !== role) return false;
      if (q && !e.name.toLowerCase().includes(q.toLowerCase()) && !e.email.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [role, q]);

  const counts = useM2(() => {
    const c = { all: EMPLEADOS_DATA.length };
    EMPLEADOS_DATA.forEach(e => { c[e.role] = (c[e.role] || 0) + 1; });
    return c;
  }, []);

  const roles = [
    { id: "all", label: "Todos" },
    { id: "admin", label: "Admins" },
    { id: "cocina", label: "Cocina" },
    { id: "verificador", label: "Verificadores" },
    { id: "cliente", label: "Clientes" },
  ];

  return (
    <>
      <div className="mod-head">
        <div>
          <h2 className="serif">Usuarios y Empleados</h2>
          <div className="mod-sub">Gestiona roles, permisos y accesos al sistema</div>
        </div>
        <div className="mod-head-actions">
          <button className="btn"><IconDownload size={15}/> Exportar</button>
          <button className="btn btn-accent"><IconPlus size={15}/> Invitar empleado</button>
        </div>
      </div>

      <EmpleadosStats/>

      <div className="menu-toolbar">
        <div className="search-input">
          <span className="ico"><IconSearch size={16}/></span>
          <input placeholder="Buscar por nombre o email…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
        <div className="role-tabs">
          {roles.map(r => (
            <button key={r.id}
                    className={`role-tab ${role === r.id ? "active" : ""}`}
                    onClick={() => setRole(r.id)}>
              {r.label} <span className="badge" style={{ background: role === r.id ? "rgba(255,255,255,0.18)" : "var(--cream-200)", color: role === r.id ? "var(--cream-100)" : "var(--ink-700)", borderRadius: "var(--r-full)", padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>{counts[r.id] || 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="emp-grid">
        {filtered.map(e => <EmpleadoCard key={e.id} emp={e}/>)}
      </div>
    </>
  );
};

window.EmpleadosPage = EmpleadosPage;
