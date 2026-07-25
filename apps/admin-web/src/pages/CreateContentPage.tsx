import { type SyntheticEvent, useState } from "react";

import type { AuthenticatedUser } from "../auth/authClient.js";
import { AdminShell } from "../components/AdminShell.js";
import { createEditorialContent } from "../content/editorialCatalogClient.js";

type CreateContentPageProps = {
  user?: AuthenticatedUser | undefined;
  onLogout?: (() => Promise<void>) | undefined;
};

export const CreateContentPage = ({ user, onLogout }: CreateContentPageProps) => {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [contentType, setContentType] = useState("story");
  const [audience, setAudience] = useState("children");
  const [readingLevel, setReadingLevel] = useState("beginner");
  const [spanish, setSpanish] = useState(true);
  const [english, setEnglish] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [createdTitle, setCreatedTitle] = useState("");

  const updateTitle = (value: string) => {
    setTitle(value);
    if (slug === "" || slug === slugify(title)) {
      setSlug(slugify(value));
    }
  };

  const toggleCategory = (category: string) => {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  };

  const submit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const languages = [...(spanish ? ["es"] : []), ...(english ? ["en"] : [])];
    if (languages.length === 0) {
      setState("error");
      return;
    }
    setState("saving");
    const body = {
      slug,
      title,
      content_type: contentType,
      audience,
      reading_level: readingLevel,
      languages,
      categories,
    };
    if (user === undefined) {
      window.setTimeout(() => {
        setCreatedTitle(title);
        setState("success");
      }, 250);
      return;
    }
    void createEditorialContent(body)
      .then((created) => {
        setCreatedTitle(created.title);
        setState("success");
      })
      .catch(() => {
        setState("error");
      });
  };

  return (
    <AdminShell activeItem="content" user={user} onLogout={onLogout}>
      <main className="dashboard content-create-page">
        <div className="page-heading">
          <div>
            <a className="back-link" href="/content">
              ← Volver a Contenidos
            </a>
            <p className="eyebrow">Nuevo borrador</p>
            <h1>Crear contenido</h1>
            <p className="page-subtitle">
              Define la base editorial. Podrás escribir capítulos y párrafos en el siguiente paso.
            </p>
          </div>
          <div className="draft-indicator">
            <span aria-hidden="true">●</span> Se guardará como borrador
          </div>
        </div>

        {state === "success" ? (
          <section className="panel creation-success" aria-live="polite">
            <span className="creation-success__mark" aria-hidden="true">
              ✓
            </span>
            <p className="eyebrow">Borrador creado</p>
            <h2>{createdTitle}</h2>
            <p>Los metadatos quedaron guardados. Ya puedes volver al catálogo.</p>
            <div>
              <a className="button button--primary" href="/content">
                Ver catálogo
              </a>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => {
                  setTitle("");
                  setSlug("");
                  setState("idle");
                }}
              >
                Crear otro
              </button>
            </div>
          </section>
        ) : (
          <form className="creation-layout" onSubmit={submit}>
            <section className="panel creation-form" aria-labelledby="identity-title">
              <div className="section-heading">
                <span className="section-number">1</span>
                <div>
                  <h2 id="identity-title">Identidad de la lectura</h2>
                  <p>
                    El título será visible para lectores y el identificador se usará internamente.
                  </p>
                </div>
              </div>

              <label className="creation-field">
                <span>Título principal</span>
                <input
                  required
                  minLength={2}
                  maxLength={240}
                  value={title}
                  placeholder="Ej. El viaje de Luna"
                  onChange={(event) => {
                    updateTitle(event.target.value);
                  }}
                />
              </label>
              <label className="creation-field">
                <span>Identificador URL</span>
                <div className="slug-field">
                  <span>followread.app/</span>
                  <input
                    required
                    minLength={3}
                    maxLength={120}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value.toLocaleLowerCase());
                    }}
                  />
                </div>
                <small>Usa letras minúsculas, números y guiones.</small>
              </label>

              <div className="creation-grid">
                <label className="creation-field">
                  <span>Tipo de contenido</span>
                  <select
                    value={contentType}
                    onChange={(event) => {
                      setContentType(event.target.value);
                    }}
                  >
                    <option value="story">Cuento</option>
                    <option value="lesson">Lección</option>
                    <option value="article">Artículo</option>
                    <option value="book">Libro</option>
                  </select>
                </label>
                <label className="creation-field">
                  <span>Audiencia</span>
                  <select
                    value={audience}
                    onChange={(event) => {
                      setAudience(event.target.value);
                    }}
                  >
                    <option value="children">Infantil</option>
                    <option value="teenager">Adolescentes</option>
                    <option value="adult">Adultos</option>
                    <option value="all">Todas las edades</option>
                  </select>
                </label>
                <label className="creation-field">
                  <span>Nivel de lectura</span>
                  <select
                    value={readingLevel}
                    onChange={(event) => {
                      setReadingLevel(event.target.value);
                    }}
                  >
                    <option value="beginner">Inicial</option>
                    <option value="elementary">Elemental</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="upper-intermediate">Intermedio alto</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </label>
              </div>
            </section>

            <aside className="creation-sidebar">
              <section className="panel creation-options" aria-labelledby="language-title">
                <div className="section-heading section-heading--compact">
                  <span className="section-number">2</span>
                  <div>
                    <h2 id="language-title">Idiomas</h2>
                    <p>Selecciona al menos uno.</p>
                  </div>
                </div>
                <label className="option-card">
                  <input
                    type="checkbox"
                    checked={spanish}
                    onChange={(event) => {
                      setSpanish(event.target.checked);
                    }}
                  />
                  <span className="language-mark">ES</span>
                  <span>
                    <strong>Español</strong>
                    <small>Idioma principal</small>
                  </span>
                </label>
                <label className="option-card">
                  <input
                    type="checkbox"
                    checked={english}
                    onChange={(event) => {
                      setEnglish(event.target.checked);
                    }}
                  />
                  <span className="language-mark language-mark--blue">EN</span>
                  <span>
                    <strong>Inglés</strong>
                    <small>Traducción paralela</small>
                  </span>
                </label>
              </section>

              <section className="panel creation-options" aria-labelledby="category-title">
                <div className="section-heading section-heading--compact">
                  <span className="section-number">3</span>
                  <div>
                    <h2 id="category-title">Categorías</h2>
                    <p>Ayudan a descubrir la lectura.</p>
                  </div>
                </div>
                <div className="category-options">
                  {[
                    ["adventure", "Aventura"],
                    ["nature", "Naturaleza"],
                    ["learning", "Aprendizaje"],
                    ["family", "Familia"],
                  ].map(([value, label]) => (
                    <label key={value}>
                      <input
                        type="checkbox"
                        checked={categories.includes(value ?? "")}
                        onChange={() => {
                          toggleCategory(value ?? "");
                        }}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </section>

              {state === "error" ? (
                <div className="form-alert" role="alert">
                  <span aria-hidden="true">!</span>
                  <p>
                    No pudimos guardar el borrador. Revisa los campos, elige un idioma e inténtalo
                    otra vez.
                  </p>
                </div>
              ) : null}

              <button
                className="button button--primary creation-submit"
                type="submit"
                disabled={state === "saving"}
              >
                {state === "saving" ? "Guardando…" : "Crear borrador"}
              </button>
              <a className="button button--quiet creation-cancel" href="/content">
                Cancelar
              </a>
            </aside>
          </form>
        )}
      </main>
    </AdminShell>
  );
};

const slugify = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
