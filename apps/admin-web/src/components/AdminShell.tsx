import type { ReactNode } from "react";

type AdminShellProps = {
  activeItem: "dashboard" | "content";
  children: ReactNode;
};

const navigationItems = [
  { id: "dashboard", icon: "⌂", label: "Resumen", href: "/" },
  { id: "content", icon: "▤", label: "Contenidos", href: "/content" },
  { id: "processing", icon: "◌", label: "Procesamiento", href: "/#processing" },
  { id: "reviews", icon: "✓", label: "Revisión", href: "/#reviews", count: 3 },
  { id: "publication", icon: "↑", label: "Publicaciones", href: "/#publication" },
] as const;

export const AdminShell = ({ activeItem, children }: AdminShellProps) => (
  <div className="admin-layout">
    <aside className="sidebar">
      <a className="brand brand--sidebar" href="/" aria-label="FollowRead Admin, ir al resumen">
        <span className="brand__mark" aria-hidden="true">
          F
        </span>
        <span>
          <strong>FollowRead</strong>
          <small>Administración</small>
        </span>
      </a>

      <nav className="primary-nav" aria-label="Navegación principal">
        <p className="nav-label">Espacio editorial</p>
        {navigationItems.map((item) => (
          <a
            className={`nav-item ${activeItem === item.id ? "nav-item--active" : ""}`}
            href={item.href}
            aria-current={activeItem === item.id ? "page" : undefined}
            key={item.id}
          >
            <span className="nav-icon" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
            {"count" in item ? <span className="nav-count">{item.count}</span> : null}
          </a>
        ))}
      </nav>

      <div className="sidebar__footer">
        <a className="nav-item" href="/documentation">
          <span className="nav-icon" aria-hidden="true">
            ?
          </span>
          <span>Ayuda y documentación</span>
        </a>
        <div className="user-card">
          <span className="avatar" aria-hidden="true">
            DE
          </span>
          <span className="user-card__identity">
            <strong>Daniela Editora</strong>
            <small>Equipo editorial</small>
          </span>
          <a className="icon-link" href="/login" aria-label="Salir de la vista previa">
            ↗
          </a>
        </div>
      </div>
    </aside>

    <div className="admin-workspace">
      <header className="mobile-header">
        <a className="brand" href="/" aria-label="FollowRead Admin, ir al resumen">
          <span className="brand__mark" aria-hidden="true">
            F
          </span>
          <strong>FollowRead</strong>
        </a>
        <details className="mobile-menu">
          <summary aria-label="Abrir navegación">
            <span aria-hidden="true">☰</span>
          </summary>
          <nav aria-label="Navegación móvil">
            {navigationItems.map((item) => (
              <a href={item.href} key={item.id}>
                {item.label}
              </a>
            ))}
            <a href="/documentation">Ayuda y documentación</a>
            <a href="/login">Salir de la vista previa</a>
          </nav>
        </details>
      </header>

      <div className="preview-banner" role="status">
        <span className="preview-banner__dot" aria-hidden="true" />
        Vista previa visual con datos de ejemplo
      </div>
      {children}
    </div>
  </div>
);
