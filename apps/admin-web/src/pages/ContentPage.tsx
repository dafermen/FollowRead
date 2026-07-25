import { AdminShell } from "../components/AdminShell.js";

const catalogItems = [
  {
    title: "El zorro y la luna",
    type: "Cuento",
    audience: "Infantil",
    languages: "ES / EN",
    version: "v3",
    status: "Borrador",
    statusClass: "draft",
    updated: "Hace 18 min",
    initials: "ZL",
    coverClass: "cover--sunset",
  },
  {
    title: "The River Between Us",
    type: "Lección",
    audience: "Aprender inglés",
    languages: "EN / ES",
    version: "v2",
    status: "En revisión",
    statusClass: "review",
    updated: "Hace 2 h",
    initials: "TR",
    coverClass: "cover--river",
  },
  {
    title: "El jardín secreto",
    type: "Artículo",
    audience: "Adultos",
    languages: "ES",
    version: "v1",
    status: "Procesando",
    statusClass: "processing",
    updated: "Ayer, 16:40",
    initials: "JS",
    coverClass: "cover--garden",
  },
  {
    title: "La casa de los sonidos",
    type: "Cuento",
    audience: "Infantil",
    languages: "ES",
    version: "v4",
    status: "Publicado",
    statusClass: "published",
    updated: "Hoy, 09:34",
    initials: "CS",
    coverClass: "cover--night",
  },
] as const;

export const ContentPage = () => (
  <AdminShell activeItem="content">
    <main className="dashboard content-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Biblioteca editorial</p>
          <h1>Contenidos</h1>
          <p className="page-subtitle">
            Crea, organiza y acompaña cada lectura hasta su publicación.
          </p>
        </div>
        <button className="button button--primary" type="button">
          <span aria-hidden="true">＋</span>
          Crear contenido
        </button>
      </div>

      <section className="panel catalog-panel" aria-labelledby="catalog-title">
        <div className="catalog-toolbar">
          <h2 className="visually-hidden" id="catalog-title">
            Catálogo editorial
          </h2>
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <span className="visually-hidden">Buscar contenido</span>
            <input type="search" placeholder="Buscar por título..." />
          </label>
          <label className="filter-field">
            <span className="visually-hidden">Filtrar por estado</span>
            <select defaultValue="">
              <option value="">Todos los estados</option>
              <option>Borrador</option>
              <option>En revisión</option>
              <option>Publicado</option>
            </select>
          </label>
          <label className="filter-field">
            <span className="visually-hidden">Filtrar por tipo</span>
            <select defaultValue="">
              <option value="">Todos los tipos</option>
              <option>Cuento</option>
              <option>Lección</option>
              <option>Artículo</option>
            </select>
          </label>
          <button className="button button--secondary" type="button">
            Más filtros
          </button>
        </div>

        <div className="catalog-summary">
          <p>
            <strong>24 contenidos</strong> en el catálogo
          </p>
          <label className="sort-field">
            <span>Ordenar:</span>
            <select defaultValue="recent">
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
            <span role="columnheader" className="visually-hidden">
              Acción
            </span>
          </div>
          {catalogItems.map((item) => (
            <a className="catalog-row" href="/content" role="row" key={item.title}>
              <span className="catalog-title" role="cell">
                <span className={`mini-cover ${item.coverClass}`} aria-hidden="true">
                  {item.initials}
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>
                    {item.audience} · {item.languages}
                  </small>
                </span>
              </span>
              <span data-label="Tipo" role="cell">
                {item.type}
              </span>
              <span data-label="Versión" role="cell">
                {item.version}
              </span>
              <span data-label="Estado" role="cell">
                <span className={`status-badge status-badge--${item.statusClass}`}>
                  {item.status}
                </span>
              </span>
              <span data-label="Actualización" role="cell">
                {item.updated}
              </span>
              <span className="row-arrow" role="cell" aria-hidden="true">
                →
              </span>
            </a>
          ))}
        </div>

        <div className="pagination" aria-label="Paginación">
          <p>Página 1 de 3</p>
          <div>
            <button className="pagination__button" type="button" disabled>
              Anterior
            </button>
            <button className="pagination__button" type="button">
              Siguiente
            </button>
          </div>
        </div>
      </section>
    </main>
  </AdminShell>
);
