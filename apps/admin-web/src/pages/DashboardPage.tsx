import { AdminShell } from "../components/AdminShell.js";
import type { AuthenticatedUser } from "../auth/authClient.js";

const metrics = [
  {
    label: "Contenidos",
    value: "24",
    detail: "4 actualizados esta semana",
    tone: "blue",
    icon: "▤",
  },
  { label: "Borradores", value: "5", detail: "2 requieren completar", tone: "amber", icon: "✎" },
  { label: "En revisión", value: "3", detail: "Listos para comprobar", tone: "violet", icon: "✓" },
  { label: "Publicados", value: "16", detail: "67% del catálogo", tone: "green", icon: "↑" },
] as const;

const recentContent = [
  {
    title: "El zorro y la luna",
    meta: "Cuento · Infantil · ES / EN",
    status: "Borrador",
    statusClass: "draft",
    updated: "Hace 18 min",
    initials: "ZL",
    coverClass: "cover--sunset",
  },
  {
    title: "The River Between Us",
    meta: "Lección · Aprender inglés · EN / ES",
    status: "En revisión",
    statusClass: "review",
    updated: "Hace 2 h",
    initials: "TR",
    coverClass: "cover--river",
  },
  {
    title: "El jardín secreto",
    meta: "Artículo · Adultos · ES",
    status: "Procesando",
    statusClass: "processing",
    updated: "Ayer, 16:40",
    initials: "JS",
    coverClass: "cover--garden",
  },
] as const;

type DashboardPageProps = {
  user?: AuthenticatedUser | undefined;
  onLogout?: (() => Promise<void>) | undefined;
};

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const firstName = user?.display_name.split(" ")[0] ?? "Daniela";

  return (
    <AdminShell activeItem="dashboard" user={user} onLogout={onLogout}>
      <main className="dashboard">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Viernes, 25 de julio</p>
            <h1>Buenos días, {firstName}</h1>
            <p className="page-subtitle">
              Continúa donde lo dejaste y revisa lo que necesita atención.
            </p>
          </div>
          <a className="button button--primary" href="/content">
            <span aria-hidden="true">＋</span>
            Crear contenido
          </a>
        </div>

        <section className="metrics-grid" aria-label="Resumen del catálogo">
          {metrics.map((metric) => (
            <article className="metric-card" key={metric.label}>
              <div className={`metric-icon metric-icon--${metric.tone}`} aria-hidden="true">
                {metric.icon}
              </div>
              <div>
                <p>{metric.label}</p>
                <strong>{metric.value}</strong>
                <small>{metric.detail}</small>
              </div>
            </article>
          ))}
        </section>

        <section className="attention-card" aria-labelledby="attention-title">
          <div className="attention-card__icon" aria-hidden="true">
            !
          </div>
          <div className="attention-card__content">
            <div>
              <p className="section-kicker">Requiere atención</p>
              <h2 id="attention-title">Hay trabajo listo para continuar</h2>
            </div>
            <div className="attention-items">
              <a href="/#reviews">
                <strong>3</strong>
                <span>contenidos esperan revisión</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="/#processing">
                <strong>1</strong>
                <span>audio necesita reintento</span>
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="panel recent-panel" aria-labelledby="recent-title">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Tu espacio de trabajo</p>
                <h2 id="recent-title">Contenido reciente</h2>
              </div>
              <a className="standalone-link" href="/content">
                Ver todos <span aria-hidden="true">→</span>
              </a>
            </div>
            <div className="content-list">
              {recentContent.map((item) => (
                <a className="content-row" href="/content" key={item.title}>
                  <span className={`mini-cover ${item.coverClass}`} aria-hidden="true">
                    {item.initials}
                  </span>
                  <span className="content-row__main">
                    <strong>{item.title}</strong>
                    <small>{item.meta}</small>
                  </span>
                  <span className={`status-badge status-badge--${item.statusClass}`}>
                    {item.status}
                  </span>
                  <span className="content-row__time">{item.updated}</span>
                  <span className="row-arrow" aria-hidden="true">
                    →
                  </span>
                </a>
              ))}
            </div>
          </section>

          <aside className="panel activity-panel" aria-labelledby="activity-title">
            <div className="panel-heading">
              <div>
                <p className="section-kicker">Últimos cambios</p>
                <h2 id="activity-title">Actividad</h2>
              </div>
            </div>
            <ol className="timeline">
              <li>
                <span className="timeline__marker timeline__marker--green" aria-hidden="true">
                  ✓
                </span>
                <div>
                  <p>
                    Publicaste <strong>La casa de los sonidos</strong>
                  </p>
                  <time>Hoy, 09:34</time>
                </div>
              </li>
              <li>
                <span className="timeline__marker timeline__marker--blue" aria-hidden="true">
                  ✎
                </span>
                <div>
                  <p>
                    Actualizaste <strong>El zorro y la luna</strong>
                  </p>
                  <time>Hoy, 09:12</time>
                </div>
              </li>
              <li>
                <span className="timeline__marker timeline__marker--violet" aria-hidden="true">
                  ◌
                </span>
                <div>
                  <p>
                    El audio de <strong>The River Between Us</strong> está listo
                  </p>
                  <time>Ayer, 17:48</time>
                </div>
              </li>
            </ol>
          </aside>
        </div>
      </main>
    </AdminShell>
  );
};
