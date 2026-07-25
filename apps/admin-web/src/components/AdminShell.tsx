import type { ReactNode } from "react";

import type { AuthenticatedUser } from "../auth/authClient.js";

type AdminShellProps = {
  activeItem: "dashboard" | "content";
  children: ReactNode;
  user?: AuthenticatedUser | undefined;
  onLogout?: (() => Promise<void>) | undefined;
};

const navigationItems = [
  { id: "dashboard", icon: "⌂", label: "Resumen", href: "/" },
  {
    id: "content",
    icon: "▤",
    label: "Contenidos",
    href: "/content",
    permissions: ["content.create", "content.edit", "content.review", "content.publish"],
  },
  {
    id: "processing",
    icon: "◌",
    label: "Procesamiento",
    href: "/#processing",
    permissions: ["content.process"],
  },
  {
    id: "reviews",
    icon: "✓",
    label: "Revisión",
    href: "/#reviews",
    count: 3,
    permissions: ["content.review", "content.publish"],
  },
  {
    id: "publication",
    icon: "↑",
    label: "Publicaciones",
    href: "/#publication",
    permissions: ["content.publish"],
  },
] as const;

export const AdminShell = ({ activeItem, children, user, onLogout }: AdminShellProps) => {
  const availableNavigation = navigationItems.filter(
    (item) =>
      !("permissions" in item) ||
      user === undefined ||
      item.permissions.some((permission) => user.permissions.includes(permission)),
  );
  const displayName = user?.display_name ?? "Daniela Editora";
  const role = user?.roles[0]?.replaceAll("_", " ") ?? "Equipo editorial";
  const initials = displayName
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return (
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
          {availableNavigation.map((item) => (
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
              {initials}
            </span>
            <span className="user-card__identity">
              <strong>{displayName}</strong>
              <small>{role}</small>
            </span>
            {onLogout === undefined ? (
              <a className="icon-link" href="/login" aria-label="Salir de la vista previa">
                ↗
              </a>
            ) : (
              <button
                className="icon-link"
                type="button"
                aria-label="Cerrar sesión"
                onClick={() => {
                  void onLogout();
                }}
              >
                ↗
              </button>
            )}
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
              {availableNavigation.map((item) => (
                <a href={item.href} key={item.id}>
                  {item.label}
                </a>
              ))}
              <a href="/documentation">Ayuda y documentación</a>
              {onLogout === undefined ? (
                <a href="/login">Salir de la vista previa</a>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void onLogout();
                  }}
                >
                  Cerrar sesión
                </button>
              )}
            </nav>
          </details>
        </header>

        {user === undefined ? (
          <div className="preview-banner" role="status">
            <span className="preview-banner__dot" aria-hidden="true" />
            Vista previa visual con datos de ejemplo
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
};
