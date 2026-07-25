import { useEffect, useMemo, useState } from "react";

import type { AuthenticatedUser } from "../auth/authClient.js";
import { AdminShell } from "../components/AdminShell.js";
import {
  EditorRequestError,
  getEditorDocument,
  saveEditorDocument,
  type EditorDocument,
  type EditorTranslation,
} from "../content/editorialCatalogClient.js";

type EditorPageProps = {
  contentId: string;
  user?: AuthenticatedUser | undefined;
  onLogout?: (() => Promise<void>) | undefined;
};

const previewDocument: EditorDocument = {
  content_id: "preview",
  slug: "el-zorro-y-la-luna",
  version: 3,
  status: "draft",
  updated_at: new Date().toISOString(),
  translations: [
    {
      language: "es",
      title: "El zorro y la luna",
      summary: "Una historia sobre curiosidad y amistad.",
      chapters: [
        {
          stable_key: "chapter-1",
          position: 0,
          title: "Una luz en el bosque",
          paragraphs: [
            {
              stable_key: "paragraph-1",
              position: 0,
              text: "Cada noche, Milo observaba una luz plateada entre las ramas del bosque.",
            },
            {
              stable_key: "paragraph-2",
              position: 1,
              text: "Aquella noche decidió seguirla, con pasos pequeños y el corazón despierto.",
            },
          ],
        },
        {
          stable_key: "chapter-2",
          position: 1,
          title: "El reflejo",
          paragraphs: [
            {
              stable_key: "paragraph-3",
              position: 0,
              text: "Al llegar al lago descubrió la luna completa descansando sobre el agua.",
            },
          ],
        },
      ],
    },
    {
      language: "en",
      title: "The fox and the moon",
      summary: "A story about curiosity and friendship.",
      chapters: [],
    },
  ],
};

export const EditorPage = ({ contentId, user, onLogout }: EditorPageProps) => {
  const isPreview = user === undefined || contentId === "preview";
  const [document, setDocument] = useState<EditorDocument | null>(
    isPreview ? structuredClone(previewDocument) : null,
  );
  const [activeLanguage, setActiveLanguage] = useState("es");
  const [activeChapter, setActiveChapter] = useState(0);
  const [state, setState] = useState<
    "loading" | "saved" | "dirty" | "saving" | "error" | "conflict"
  >(isPreview ? "saved" : "loading");

  useEffect(() => {
    if (isPreview) {
      return;
    }
    let active = true;
    void getEditorDocument(contentId)
      .then((loaded) => {
        if (active) {
          setDocument(withStarterChapter(loaded));
          setActiveLanguage(loaded.translations[0]?.language ?? "es");
          setState("saved");
        }
      })
      .catch(() => {
        if (active) {
          const recovered = readRecovery(contentId);
          if (recovered === null) {
            setState("error");
          } else {
            setDocument(recovered);
            setState("dirty");
          }
        }
      });
    return () => {
      active = false;
    };
  }, [contentId, isPreview]);

  useEffect(() => {
    if (state !== "dirty" || document === null) {
      return;
    }
    window.localStorage.setItem(recoveryKey(contentId), JSON.stringify(document));
    const timer = window.setTimeout(() => {
      setState("saving");
      if (isPreview) {
        setDocument((current) =>
          current === null ? current : { ...current, updated_at: new Date().toISOString() },
        );
        setState("saved");
        return;
      }
      void saveEditorDocument(document)
        .then((saved) => {
          setDocument(saved);
          window.localStorage.removeItem(recoveryKey(contentId));
          setState("saved");
        })
        .catch((error: unknown) => {
          setState(
            error instanceof EditorRequestError && error.status === 409 ? "conflict" : "error",
          );
        });
    }, 900);
    return () => {
      window.clearTimeout(timer);
    };
  }, [contentId, document, isPreview, state]);

  useEffect(() => {
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (state === "dirty" || state === "saving") {
        event.preventDefault();
      }
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
    };
  }, [state]);

  const translation = useMemo(
    () =>
      document?.translations.find((item) => item.language === activeLanguage) ??
      document?.translations[0],
    [activeLanguage, document],
  );
  const chapter = translation?.chapters[activeChapter];

  if (document === null || translation === undefined) {
    return (
      <AdminShell activeItem="content" user={user} onLogout={onLogout}>
        <main className="session-state" aria-live="polite">
          <span className="session-state__mark" aria-hidden="true">
            {state === "error" ? "!" : "F"}
          </span>
          <h1>{state === "error" ? "No pudimos recuperar el borrador" : "Abriendo el editor…"}</h1>
          {state === "error" ? <a href="/content">Volver al catálogo</a> : null}
        </main>
      </AdminShell>
    );
  }

  const updateTranslation = (next: EditorTranslation) => {
    setDocument({
      ...document,
      translations: document.translations.map((item) =>
        item.language === next.language ? next : item,
      ),
    });
    setState("dirty");
  };

  return (
    <AdminShell activeItem="content" user={user} onLogout={onLogout}>
      <main className="editor-page">
        <header className="editor-toolbar">
          <div>
            <a href="/content">← Contenidos</a>
            <span className="editor-toolbar__divider" aria-hidden="true" />
            <div>
              <strong>{translation.title}</strong>
              <small>Borrador · v{document.version}</small>
            </div>
          </div>
          <div>
            <span className={`save-state save-state--${state}`} aria-live="polite">
              {saveLabel(state)}
            </span>
            <a
              className="button button--secondary"
              href={`/content?selected=${document.content_id}`}
            >
              Vista previa
            </a>
          </div>
        </header>

        {state === "conflict" ? (
          <div className="editor-alert" role="alert">
            <strong>Hay una versión más reciente.</strong>
            <span>Tu recuperación local se conserva. Recarga antes de volver a guardar.</span>
            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
            >
              Recargar
            </button>
          </div>
        ) : null}

        <div className="editor-layout">
          <aside className="chapter-panel" aria-label="Capítulos">
            <div className="language-switcher" aria-label="Idioma de edición">
              {document.translations.map((item) => (
                <button
                  className={item.language === activeLanguage ? "active" : ""}
                  type="button"
                  key={item.language}
                  onClick={() => {
                    setActiveLanguage(item.language);
                    setActiveChapter(0);
                  }}
                >
                  {item.language.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="chapter-panel__heading">
              <span>Capítulos</span>
              <button
                type="button"
                aria-label="Añadir capítulo"
                onClick={() => {
                  const position = translation.chapters.length;
                  updateTranslation({
                    ...translation,
                    chapters: [
                      ...translation.chapters,
                      {
                        stable_key: `chapter-${String(Date.now())}`,
                        position,
                        title: `Capítulo ${String(position + 1)}`,
                        paragraphs: [
                          {
                            stable_key: `paragraph-${String(Date.now())}`,
                            position: 0,
                            text: "Empieza a escribir aquí.",
                          },
                        ],
                      },
                    ],
                  });
                  setActiveChapter(position);
                }}
              >
                ＋
              </button>
            </div>
            <ol className="chapter-list">
              {translation.chapters.map((item, index) => (
                <li className={index === activeChapter ? "active" : ""} key={item.stable_key}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveChapter(index);
                    }}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <strong>{item.title ?? `Capítulo ${String(index + 1)}`}</strong>
                      <small>{String(item.paragraphs.length)} párrafos</small>
                    </span>
                  </button>
                  <div>
                    <button
                      type="button"
                      aria-label={`Subir ${item.title ?? "capítulo"}`}
                      disabled={index === 0}
                      onClick={() => {
                        updateTranslation({
                          ...translation,
                          chapters: moveChapter(translation.chapters, index, index - 1),
                        });
                        setActiveChapter(index - 1);
                      }}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Bajar ${item.title ?? "capítulo"}`}
                      disabled={index === translation.chapters.length - 1}
                      onClick={() => {
                        updateTranslation({
                          ...translation,
                          chapters: moveChapter(translation.chapters, index, index + 1),
                        });
                        setActiveChapter(index + 1);
                      }}
                    >
                      ↓
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          </aside>

          <section className="writing-canvas" aria-label="Editor de contenido">
            {chapter === undefined ? (
              <div className="editor-empty">
                <strong>Aún no hay capítulos en este idioma</strong>
                <p>Añade el primero desde el panel lateral.</p>
              </div>
            ) : (
              <>
                <label className="chapter-title-field">
                  <span className="visually-hidden">Título del capítulo</span>
                  <input
                    value={chapter.title ?? ""}
                    placeholder="Título del capítulo"
                    onChange={(event) => {
                      updateTranslation({
                        ...translation,
                        chapters: translation.chapters.map((item, index) =>
                          index === activeChapter ? { ...item, title: event.target.value } : item,
                        ),
                      });
                    }}
                  />
                </label>
                <div className="paragraph-stack">
                  {chapter.paragraphs.map((paragraph, index) => (
                    <article className="paragraph-editor" key={paragraph.stable_key}>
                      <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                      <label>
                        <span className="visually-hidden">Párrafo {String(index + 1)}</span>
                        <textarea
                          value={paragraph.text}
                          rows={4}
                          onChange={(event) => {
                            updateTranslation({
                              ...translation,
                              chapters: translation.chapters.map((item, chapterIndex) =>
                                chapterIndex === activeChapter
                                  ? {
                                      ...item,
                                      paragraphs: item.paragraphs.map((current, paragraphIndex) =>
                                        paragraphIndex === index
                                          ? { ...current, text: event.target.value }
                                          : current,
                                      ),
                                    }
                                  : item,
                              ),
                            });
                          }}
                        />
                      </label>
                    </article>
                  ))}
                </div>
                <button
                  className="add-paragraph"
                  type="button"
                  onClick={() => {
                    updateTranslation({
                      ...translation,
                      chapters: translation.chapters.map((item, index) =>
                        index === activeChapter
                          ? {
                              ...item,
                              paragraphs: [
                                ...item.paragraphs,
                                {
                                  stable_key: `paragraph-${String(Date.now())}`,
                                  position: item.paragraphs.length,
                                  text: "Nuevo párrafo.",
                                },
                              ],
                            }
                          : item,
                      ),
                    });
                  }}
                >
                  ＋ Añadir párrafo
                </button>
              </>
            )}
          </section>

          <aside className="editor-inspector">
            <p className="eyebrow">Estructura</p>
            <h2>Estado del borrador</h2>
            <dl>
              <div>
                <dt>Idioma</dt>
                <dd>{activeLanguage.toUpperCase()}</dd>
              </div>
              <div>
                <dt>Capítulos</dt>
                <dd>{translation.chapters.length}</dd>
              </div>
              <div>
                <dt>Párrafos</dt>
                <dd>
                  {translation.chapters.reduce((total, item) => total + item.paragraphs.length, 0)}
                </dd>
              </div>
            </dl>
            <div className="recovery-note">
              <span aria-hidden="true">↻</span>
              <p>
                <strong>Recuperación activa</strong>
                Tus cambios se conservan en este dispositivo hasta confirmar el guardado.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </AdminShell>
  );
};

const withStarterChapter = (document: EditorDocument): EditorDocument => ({
  ...document,
  translations: document.translations.map((translation) =>
    translation.chapters.length === 0
      ? {
          ...translation,
          chapters: [
            {
              stable_key: `chapter-${translation.language}-1`,
              position: 0,
              title: "Capítulo 1",
              paragraphs: [
                {
                  stable_key: `paragraph-${translation.language}-1`,
                  position: 0,
                  text: "Empieza a escribir aquí.",
                },
              ],
            },
          ],
        }
      : translation,
  ),
});

const moveChapter = (
  chapters: EditorTranslation["chapters"],
  from: number,
  to: number,
): EditorTranslation["chapters"] => {
  const reordered = [...chapters];
  const [selected] = reordered.splice(from, 1);
  if (selected !== undefined) {
    reordered.splice(to, 0, selected);
  }
  return reordered.map((item, position) => ({ ...item, position }));
};

const recoveryKey = (contentId: string) => `followread-editor-recovery-${contentId}`;

const readRecovery = (contentId: string): EditorDocument | null => {
  const value = window.localStorage.getItem(recoveryKey(contentId));
  if (value === null) {
    return null;
  }
  try {
    return JSON.parse(value) as EditorDocument;
  } catch {
    return null;
  }
};

const saveLabel = (state: string) => {
  const labels: Record<string, string> = {
    loading: "Cargando…",
    saved: "✓ Guardado",
    dirty: "Cambios pendientes",
    saving: "Guardando…",
    error: "No se pudo guardar",
    conflict: "Conflicto de versión",
  };
  return labels[state] ?? state;
};
