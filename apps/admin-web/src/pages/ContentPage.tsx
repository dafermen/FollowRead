import { type SyntheticEvent, useEffect, useMemo, useState } from "react";

import type { AuthenticatedUser } from "../auth/authClient.js";
import { AdminShell } from "../components/AdminShell.js";
import {
  getEditorialContent,
  type EditorialCatalogItem,
  type EditorialCatalogPage,
} from "../content/editorialCatalogClient.js";

const PAGE_SIZE = 8;

const previewItems: EditorialCatalogItem[] = [
  {
    id: "preview-1",
    slug: "el-zorro-y-la-luna",
    title: "El zorro y la luna",
    content_type: "story",
    audience: "children",
    languages: ["es", "en"],
    version: 3,
    status: "draft",
    updated_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    actions: ["view", "edit"],
  },
  {
    id: "preview-2",
    slug: "the-river-between-us",
    title: "The River Between Us",
    content_type: "lesson",
    audience: "all",
    languages: ["en", "es"],
    version: 2,
    status: "ready_for_review",
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    actions: ["view", "review"],
  },
  {
    id: "preview-3",
    slug: "el-jardin-secreto",
    title: "El jardín secreto",
    content_type: "article",
    audience: "adult",
    languages: ["es"],
    version: 1,
    status: "processing",
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actions: ["view"],
  },
  {
    id: "preview-4",
    slug: "la-casa-de-los-sonidos",
    title: "La casa de los sonidos",
    content_type: "story",
    audience: "children",
    languages: ["es"],
    version: 4,
    status: "published",
    updated_at: new Date().toISOString(),
    actions: ["view"],
  },
];

const typeLabels: Record<string, string> = {
  story: "Cuento",
  lesson: "Lección",
  article: "Artículo",
  book: "Libro",
};

const audienceLabels: Record<string, string> = {
  children: "Infantil",
  teenager: "Adolescentes",
  adult: "Adultos",
  all: "Todas las edades",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  ready_for_processing: "Listo para procesar",
  processing: "Procesando",
  processing_failed: "Procesamiento fallido",
  ready_for_review: "En revisión",
  review_rejected: "Requiere cambios",
  approved: "Aprobado",
  published: "Publicado",
  unpublished: "Sin publicar",
  archived: "Archivado",
};

const statusClasses: Record<string, string> = {
  draft: "draft",
  ready_for_processing: "processing",
  processing: "processing",
  processing_failed: "failed",
  ready_for_review: "review",
  review_rejected: "failed",
  approved: "review",
  published: "published",
  unpublished: "draft",
  archived: "draft",
};

const actionLabels: Record<string, string> = {
  view: "Ver",
  edit: "Editar",
  process: "Procesar",
  review: "Revisar",
  publish: "Publicar",
};

const coverClasses = ["cover--sunset", "cover--river", "cover--garden", "cover--night"];

type ContentPageProps = {
  user?: AuthenticatedUser | undefined;
  onLogout?: (() => Promise<void>) | undefined;
};

export const ContentPage = ({ user, onLogout }: ContentPageProps) => {
  const isPreview = user === undefined;
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [contentType, setContentType] = useState("");
  const [sort, setSort] = useState("recent");
  const [offset, setOffset] = useState(0);
  const [catalog, setCatalog] = useState<EditorialCatalogPage>({
    items: isPreview ? previewItems : [],
    total: isPreview ? previewItems.length : 0,
    limit: PAGE_SIZE,
    offset: 0,
  });
  const [catalogState, setCatalogState] = useState<"ready" | "loading" | "error">(
    isPreview ? "ready" : "loading",
  );

  const previewCatalog = useMemo<EditorialCatalogPage>(() => {
    const normalizedSearch = search.toLocaleLowerCase();
    const filtered = previewItems.filter(
      (item) =>
        (normalizedSearch === "" ||
          `${item.title} ${item.slug}`.toLocaleLowerCase().includes(normalizedSearch)) &&
        (status === "" || item.status === status) &&
        (contentType === "" || item.content_type === contentType),
    );
    const sorted = [...filtered].sort((left, right) => {
      if (sort === "title") {
        return left.title.localeCompare(right.title);
      }
      if (sort === "status") {
        return left.status.localeCompare(right.status);
      }
      return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
    });
    return {
      items: sorted.slice(offset, offset + PAGE_SIZE),
      total: sorted.length,
      limit: PAGE_SIZE,
      offset,
    };
  }, [contentType, offset, search, sort, status]);

  useEffect(() => {
    if (isPreview) {
      return;
    }
    let active = true;
    void getEditorialContent({
      search,
      status,
      contentType,
      sort,
      limit: PAGE_SIZE,
      offset,
    })
      .then((page) => {
        if (active) {
          setCatalog(page);
          setCatalogState("ready");
        }
      })
      .catch(() => {
        if (active) {
          setCatalogState("error");
        }
      });
    return () => {
      active = false;
    };
  }, [contentType, isPreview, offset, search, sort, status]);

  const submitSearch = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    setOffset(0);
    setSearch(searchInput.trim());
  };
  const displayCatalog = isPreview ? previewCatalog : catalog;
  const pageNumber = Math.floor(displayCatalog.offset / displayCatalog.limit) + 1;
  const pageCount = Math.max(1, Math.ceil(displayCatalog.total / displayCatalog.limit));
  const canCreate = user === undefined || user.permissions.includes("content.create");

  return (
    <AdminShell activeItem="content" user={user} onLogout={onLogout}>
      <main className="dashboard content-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Biblioteca editorial</p>
            <h1>Contenidos</h1>
            <p className="page-subtitle">
              Crea, organiza y acompaña cada lectura hasta su publicación.
            </p>
          </div>
          {canCreate ? (
            <a className="button button--primary" href="/content/new">
              <span aria-hidden="true">＋</span>
              Crear contenido
            </a>
          ) : null}
        </div>

        <section className="panel catalog-panel" aria-labelledby="catalog-title">
          <form className="catalog-toolbar" onSubmit={submitSearch}>
            <h2 className="visually-hidden" id="catalog-title">
              Catálogo editorial
            </h2>
            <label className="search-field">
              <span aria-hidden="true">⌕</span>
              <span className="visually-hidden">Buscar contenido</span>
              <input
                type="search"
                placeholder="Buscar por título..."
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                }}
              />
            </label>
            <label className="filter-field">
              <span className="visually-hidden">Filtrar por estado</span>
              <select
                value={status}
                onChange={(event) => {
                  setOffset(0);
                  setStatus(event.target.value);
                }}
              >
                <option value="">Todos los estados</option>
                <option value="draft">Borrador</option>
                <option value="ready_for_review">En revisión</option>
                <option value="published">Publicado</option>
                <option value="processing_failed">Con error</option>
              </select>
            </label>
            <label className="filter-field">
              <span className="visually-hidden">Filtrar por tipo</span>
              <select
                value={contentType}
                onChange={(event) => {
                  setOffset(0);
                  setContentType(event.target.value);
                }}
              >
                <option value="">Todos los tipos</option>
                <option value="story">Cuento</option>
                <option value="lesson">Lección</option>
                <option value="article">Artículo</option>
                <option value="book">Libro</option>
              </select>
            </label>
            <button className="button button--secondary" type="submit">
              Buscar
            </button>
          </form>

          {catalogState === "error" ? (
            <div className="inline-alert" role="alert">
              No pudimos actualizar el catálogo. Puedes cambiar los filtros para reintentar.
            </div>
          ) : null}

          <div className="catalog-summary">
            <p aria-live="polite">
              <strong>
                {catalogState === "loading"
                  ? "Actualizando…"
                  : `${String(displayCatalog.total)} contenidos`}
              </strong>{" "}
              {catalogState === "loading" ? "" : "en el catálogo"}
            </p>
            <label className="sort-field">
              <span>Ordenar:</span>
              <select
                value={sort}
                onChange={(event) => {
                  setOffset(0);
                  setSort(event.target.value);
                }}
              >
                <option value="recent">Más recientes</option>
                <option value="title">Título</option>
                <option value="status">Estado</option>
              </select>
            </label>
          </div>

          <div className="catalog-table" role="table" aria-label="Contenidos">
            <div className="catalog-table__header" role="row">
              <span role="columnheader">Contenido</span>
              <span role="columnheader">Tipo</span>
              <span role="columnheader">Versión</span>
              <span role="columnheader">Estado</span>
              <span role="columnheader">Actualización</span>
              <span role="columnheader">Acción</span>
            </div>
            {displayCatalog.items.map((item, index) => (
              <a
                className="catalog-row"
                href={`/content?selected=${item.id}`}
                role="row"
                key={item.id}
              >
                <span className="catalog-title" role="cell">
                  <span className={`mini-cover ${coverClass(index)}`} aria-hidden="true">
                    {initials(item.title)}
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>
                      {audienceLabels[item.audience] ?? item.audience} ·{" "}
                      {item.languages.map((language) => language.toUpperCase()).join(" / ") || "—"}
                    </small>
                  </span>
                </span>
                <span data-label="Tipo" role="cell">
                  {typeLabels[item.content_type] ?? item.content_type}
                </span>
                <span data-label="Versión" role="cell">
                  v{item.version}
                </span>
                <span data-label="Estado" role="cell">
                  <span
                    className={`status-badge status-badge--${statusClasses[item.status] ?? "draft"}`}
                  >
                    {statusLabels[item.status] ?? item.status}
                  </span>
                </span>
                <span data-label="Actualización" role="cell">
                  {relativeDate(item.updated_at)}
                </span>
                <span className="catalog-action" data-label="Acción" role="cell">
                  {actionLabels[preferredAction(item.actions)] ?? "Ver"} <span>→</span>
                </span>
              </a>
            ))}
            {catalogState === "ready" && displayCatalog.items.length === 0 ? (
              <div className="catalog-empty">
                <span aria-hidden="true">⌕</span>
                <strong>No encontramos contenidos</strong>
                <p>Prueba otra búsqueda o limpia los filtros del catálogo.</p>
              </div>
            ) : null}
          </div>

          <div className="pagination" aria-label="Paginación">
            <p>
              Página {pageNumber} de {pageCount}
            </p>
            <div>
              <button
                className="pagination__button"
                type="button"
                disabled={offset === 0 || catalogState === "loading"}
                onClick={() => {
                  setOffset(Math.max(0, offset - PAGE_SIZE));
                }}
              >
                Anterior
              </button>
              <button
                className="pagination__button"
                type="button"
                disabled={
                  offset + displayCatalog.limit >= displayCatalog.total ||
                  catalogState === "loading"
                }
                onClick={() => {
                  setOffset(offset + PAGE_SIZE);
                }}
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </main>
    </AdminShell>
  );
};

const initials = (title: string) =>
  title
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

const preferredAction = (actions: string[]) =>
  ["publish", "review", "process", "edit", "view"].find((action) => actions.includes(action)) ??
  "view";

const coverClass = (index: number) =>
  coverClasses.at(index % coverClasses.length) ?? "cover--sunset";

const relativeDate = (value: string) => {
  const elapsedMinutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60_000));
  if (elapsedMinutes < 60) {
    return `Hace ${String(elapsedMinutes)} min`;
  }
  const elapsedHours = Math.round(elapsedMinutes / 60);
  if (elapsedHours < 24) {
    return `Hace ${String(elapsedHours)} h`;
  }
  return new Intl.DateTimeFormat("es", { day: "numeric", month: "short" }).format(new Date(value));
};
