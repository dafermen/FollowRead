import { useEffect, useState } from "react";

import type { AuthenticatedUser } from "../auth/authClient.js";
import { AdminShell } from "../components/AdminShell.js";
import { getDashboardSummary, type DashboardSummary } from "../dashboard/dashboardClient.js";

const previewMetrics = [
  {
    label: "Contenidos",
    value: "4",
    detail: "Catálogo de demostración completo",
    tone: "blue",
    icon: "▤",
  },
  { label: "Borradores", value: "0", detail: "Sin pendientes", tone: "amber", icon: "✎" },
  { label: "En revisión", value: "0", detail: "Sin pendientes", tone: "violet", icon: "✓" },
  { label: "Publicados", value: "4", detail: "100% del catálogo", tone: "green", icon: "↑" },
];

const previewContent = [
  {
    title: "El zorro y la luna",
    meta: "Cuento · Infantil · ES / EN",
    status: "Publicado",
    statusClass: "published",
    updated: "Hoy",
    initials: "ZL",
    coverClass: "cover--sunset",
  },
  {
    title: "The River Between Us",
    meta: "Lección · Aprender inglés · EN / ES",
    status: "Publicado",
    statusClass: "published",
    updated: "Hoy",
    initials: "TR",
    coverClass: "cover--river",
  },
  {
    title: "El jardín secreto",
    meta: "Artículo · Adultos · ES / EN",
    status: "Publicado",
    statusClass: "published",
    updated: "Hoy",
    initials: "JS",
    coverClass: "cover--garden",
  },
];

const previewActivity = [
  {
    action: "Publicaste",
    target: "La casa de los sonidos",
    time: "Hoy, 09:34",
    marker: "✓",
    tone: "green",
  },
  {
    action: "Actualizaste",
    target: "El zorro y la luna",
    time: "Hoy, 09:12",
    marker: "✎",
    tone: "blue",
  },
  {
    action: "El audio quedó listo para",
    target: "The River Between Us",
    time: "Ayer, 17:48",
    marker: "◌",
    tone: "violet",
  },
];

type DashboardPageProps = {
  user?: AuthenticatedUser | undefined;
  onLogout?: (() => Promise<void>) | undefined;
};

export const DashboardPage = ({ user, onLogout }: DashboardPageProps) => {
  const firstName = user?.display_name.split(" ")[0] ?? "Daniela";
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dashboardError, setDashboardError] = useState(false);

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    let active = true;
    void getDashboardSummary()
      .then((result) => {
        if (active) {
          setSummary(result);
          setDashboardError(false);
        }
      })
      .catch(() => {
        if (active) setDashboardError(true);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const metrics = summary === null ? previewMetrics : dashboardMetrics(summary);
  const recentContent =
    summary === null ? previewContent : summary.recent_content.map(recentContentItem);
  const reviews = summary?.attention.reviews ?? 3;
  const failedJobs = summary?.attention.failed_jobs ?? 1;
  const activity =
    summary === null
      ? previewActivity
      : summary.activity.map((item) => ({
          action: actionLabel(item.action),
          target: targetLabel(item.target_type),
          time: formattedDate(item.occurred_at),
          marker: item.outcome === "succeeded" ? "✓" : "!",
          tone: item.outcome === "succeeded" ? "green" : "violet",
        }));

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

        {dashboardError ? (
          <div className="inline-alert" role="alert">
            No pudimos actualizar el resumen. Conservamos el contexto; vuelve a intentarlo al
            recargar.
          </div>
        ) : null}

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
                <strong>{reviews}</strong>
                <span>contenidos esperan revisión</span>
                <span aria-hidden="true">→</span>
              </a>
              <a href="/#processing">
                <strong>{failedJobs}</strong>
                <span>audios necesitan reintento</span>
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
              {recentContent.length === 0 ? (
                <div className="empty-state">
                  <strong>El catálogo todavía está vacío</strong>
                  <p>Crea el primer borrador para comenzar el flujo editorial.</p>
                  <a href="/content">Crear contenido</a>
                </div>
              ) : (
                recentContent.map((item) => (
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
                ))
              )}
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
              {activity.length === 0 ? (
                <li className="timeline__empty">La actividad aparecerá aquí.</li>
              ) : (
                activity.map((item, index) => (
                  <li key={`${item.action}-${item.time}-${String(index)}`}>
                    <span
                      className={`timeline__marker timeline__marker--${item.tone}`}
                      aria-hidden="true"
                    >
                      {item.marker}
                    </span>
                    <div>
                      <p>
                        {item.action} <strong>{item.target}</strong>
                      </p>
                      <time>{item.time}</time>
                    </div>
                  </li>
                ))
              )}
            </ol>
          </aside>
        </div>
      </main>
    </AdminShell>
  );
};

const dashboardMetrics = (summary: DashboardSummary) => [
  {
    label: "Contenidos",
    value: String(summary.metrics.total),
    detail: "En el catálogo editorial",
    tone: "blue",
    icon: "▤",
  },
  {
    label: "Borradores",
    value: String(summary.metrics.drafts),
    detail: "Pendientes de completar",
    tone: "amber",
    icon: "✎",
  },
  {
    label: "En revisión",
    value: String(summary.metrics.in_review),
    detail: "Listos para comprobar",
    tone: "violet",
    icon: "✓",
  },
  {
    label: "Publicados",
    value: String(summary.metrics.published),
    detail: "Disponibles para lectores",
    tone: "green",
    icon: "↑",
  },
];

const recentContentItem = (item: DashboardSummary["recent_content"][number]) => ({
  title: item.title,
  meta: `${contentTypeLabel(item.content_type)} · ${audienceLabel(item.audience)} · ${item.languages.join(" / ").toUpperCase()}`,
  status: statusLabel(item.status),
  statusClass: statusTone(item.status),
  updated: formattedDate(item.updated_at),
  initials: item.title
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase(),
  coverClass: coverTones[item.id.length % coverTones.length] ?? "cover--sunset",
});

const coverTones = ["cover--sunset", "cover--river", "cover--garden", "cover--night"] as const;

const contentTypeLabel = (value: string) =>
  ({ story: "Cuento", lesson: "Lección", article: "Artículo", book: "Libro" })[value] ?? value;

const audienceLabel = (value: string) =>
  ({ children: "Infantil", teenager: "Jóvenes", adult: "Adultos", all: "Todas las edades" })[
    value
  ] ?? value;

const statusLabel = (value: string) =>
  ({
    draft: "Borrador",
    processing: "Procesando",
    processing_failed: "Error de proceso",
    ready_for_review: "En revisión",
    approved: "Aprobado",
    published: "Publicado",
  })[value] ?? value.replaceAll("_", " ");

const statusTone = (value: string) => {
  if (value === "published") return "published";
  if (value === "ready_for_review" || value === "approved") return "review";
  if (value.includes("processing")) return "processing";
  return "draft";
};

const formattedDate = (value: string) =>
  new Intl.DateTimeFormat("es", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const actionLabel = (value: string) =>
  (
    ({
      "auth.login": "Iniciaste sesión en",
      "auth.logout": "Cerraste sesión en",
      "content.updated": "Actualizaste",
      "content.published": "Publicaste",
    }) as Record<string, string>
  )[value] ?? value.replaceAll(".", " ");

const targetLabel = (value: string) =>
  ({ user_session: "FollowRead Admin", content: "un contenido" })[value] ?? value;
