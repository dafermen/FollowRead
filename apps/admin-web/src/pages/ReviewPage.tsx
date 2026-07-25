import { useEffect, useState } from "react";

import type { AuthenticatedUser } from "../auth/authClient.js";
import { AdminShell } from "../components/AdminShell.js";
import { getEditorialContent } from "../content/editorialCatalogClient.js";
import {
  getReviewSnapshot,
  transitionReview,
  type ReviewAction,
  type ReviewSnapshot,
} from "../review/reviewClient.js";

const previewChecks = [
  { code: "text", label: "Texto estructurado completo", passed: true },
  { code: "alignment", label: "Traducciones alineadas", passed: true },
  { code: "audio", label: "Audio listo por idioma", passed: true },
];

const previewSnapshots: ReviewSnapshot[] = [
  {
    content_id: "review-1",
    content_version_id: "version-1",
    title: "The River Between Us",
    version: 2,
    status: "ready_for_review",
    checks: previewChecks,
    history: [],
  },
  {
    content_id: "review-2",
    content_version_id: "version-2",
    title: "El jardín secreto",
    version: 4,
    status: "approved",
    checks: previewChecks,
    history: [
      {
        action: "approve",
        created_at: new Date(Date.now() - 35 * 60_000).toISOString(),
        note: "Lectura y sincronización verificadas.",
      },
    ],
  },
  {
    content_id: "review-3",
    content_version_id: "version-3",
    title: "La casa de los sonidos",
    version: 3,
    status: "published",
    checks: previewChecks,
    history: [
      {
        action: "publish",
        created_at: new Date(Date.now() - 2 * 60 * 60_000).toISOString(),
        note: null,
      },
    ],
  },
];

type ReviewPageProps = {
  user?: AuthenticatedUser | undefined;
  onLogout?: (() => Promise<void>) | undefined;
};

export const ReviewPage = ({ user, onLogout }: ReviewPageProps) => {
  const isPreview = user === undefined;
  const [items, setItems] = useState<ReviewSnapshot[]>(isPreview ? previewSnapshots : []);
  const [state, setState] = useState<"loading" | "ready" | "error">(
    isPreview ? "ready" : "loading",
  );

  useEffect(() => {
    if (isPreview) {
      return;
    }
    let active = true;
    const statuses = ["ready_for_review", "approved", "published", "unpublished"];
    void Promise.all(
      statuses.map((status) =>
        getEditorialContent({
          search: "",
          status,
          contentType: "",
          sort: "recent",
          limit: 20,
          offset: 0,
        }),
      ),
    )
      .then((pages) =>
        Promise.all(pages.flatMap((page) => page.items).map((item) => getReviewSnapshot(item.id))),
      )
      .then((snapshots) => {
        if (active) {
          setItems(snapshots);
          setState("ready");
        }
      })
      .catch(() => {
        if (active) {
          setState("error");
        }
      });
    return () => {
      active = false;
    };
  }, [isPreview]);

  const applyAction = (item: ReviewSnapshot, action: ReviewAction) => {
    if (isPreview) {
      const nextStatus = {
        submit: "ready_for_review",
        approve: "approved",
        reject: "review_rejected",
        publish: "published",
        unpublish: "unpublished",
        archive: "archived",
      }[action];
      setItems((current) =>
        current.map((candidate) =>
          candidate.content_id === item.content_id
            ? {
                ...candidate,
                status: nextStatus,
                history: [
                  {
                    action,
                    created_at: new Date().toISOString(),
                    note: action === "reject" ? "Requiere ajustes editoriales." : null,
                  },
                  ...candidate.history,
                ],
              }
            : candidate,
        ),
      );
      return;
    }
    setState("loading");
    void transitionReview(
      item.content_id,
      action,
      action === "reject" ? "Requiere ajustes editoriales." : undefined,
    )
      .then((updated) => {
        setItems((current) =>
          current.map((candidate) =>
            candidate.content_id === updated.content_id ? updated : candidate,
          ),
        );
        setState("ready");
      })
      .catch(() => {
        setState("error");
      });
  };

  return (
    <AdminShell activeItem="reviews" user={user} onLogout={onLogout}>
      <main className="dashboard review-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Control editorial</p>
            <h1>Revisión y publicación</h1>
            <p className="page-subtitle">
              Valida texto, traducciones y audio antes de llevar una lectura al catálogo.
            </p>
          </div>
          <div className="review-summary" aria-label="Resumen de revisión">
            <strong>{items.filter((item) => item.status === "ready_for_review").length}</strong>
            <span>esperando revisión</span>
          </div>
        </div>

        {state === "error" ? (
          <div className="inline-alert" role="alert">
            No pudimos actualizar el flujo. Ningún estado se cambió.
          </div>
        ) : null}

        <section className="review-board" aria-label="Flujo editorial">
          {items.map((item) => (
            <article className="panel review-card" key={item.content_id}>
              <header>
                <div>
                  <p className="eyebrow">Versión {item.version}</p>
                  <h2>{item.title}</h2>
                </div>
                <span className={`status-badge status-badge--${statusClass(item.status)}`}>
                  {statusLabel(item.status)}
                </span>
              </header>

              <ul className="review-checklist" aria-label={`Checklist de ${item.title}`}>
                {item.checks.map((check) => (
                  <li className={check.passed ? "passed" : ""} key={check.code}>
                    <span aria-hidden="true">{check.passed ? "✓" : "—"}</span>
                    {check.label}
                  </li>
                ))}
              </ul>

              {item.history[0] !== undefined ? (
                <div className="history-preview">
                  <span aria-hidden="true">↻</span>
                  <p>
                    <strong>{historyLabel(item.history[0].action)}</strong>
                    {item.history[0].note ?? "Movimiento registrado en el historial."}
                  </p>
                </div>
              ) : null}

              <footer>
                {actionsFor(item.status).map((action) => (
                  <button
                    className={
                      action === "approve" || action === "publish"
                        ? "button button--primary"
                        : "button button--secondary"
                    }
                    type="button"
                    disabled={state === "loading"}
                    onClick={() => {
                      applyAction(item, action);
                    }}
                    key={action}
                  >
                    {actionLabel(action)}
                  </button>
                ))}
              </footer>
            </article>
          ))}
        </section>
      </main>
    </AdminShell>
  );
};

const actionsFor = (status: string): ReviewAction[] => {
  const actions: Record<string, ReviewAction[]> = {
    draft: ["submit"],
    ready_for_review: ["reject", "approve"],
    approved: ["publish"],
    published: ["unpublish"],
    unpublished: ["publish", "archive"],
    review_rejected: ["submit", "archive"],
  };
  return actions[status] ?? [];
};

const actionLabel = (action: ReviewAction) =>
  ({
    submit: "Enviar a revisión",
    approve: "Aprobar",
    reject: "Solicitar cambios",
    publish: "Publicar",
    unpublish: "Despublicar",
    archive: "Archivar",
  })[action];

const statusLabel = (status: string) =>
  ({
    draft: "Borrador",
    ready_for_review: "En revisión",
    review_rejected: "Requiere cambios",
    approved: "Aprobado",
    published: "Publicado",
    unpublished: "Sin publicar",
    archived: "Archivado",
  })[status] ?? status;

const statusClass = (status: string) =>
  ({
    ready_for_review: "review",
    approved: "review",
    published: "published",
    review_rejected: "failed",
  })[status] ?? "draft";

const historyLabel = (action: string) =>
  ({
    approve: "Aprobado · ",
    reject: "Cambios solicitados · ",
    publish: "Publicado · ",
    unpublish: "Despublicado · ",
    archive: "Archivado · ",
  })[action] ?? "Actualizado · ";
