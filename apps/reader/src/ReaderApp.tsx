import { useEffect, useMemo, useState, type ReactNode } from "react";

import {
  getReaderLibrary,
  type ReaderLibraryItem,
  type ReaderTranslation,
} from "./readerClient.js";
import {
  DEFAULT_READER_PREFERENCES,
  preferencesForMode,
  readFavorites,
  readHistory,
  readPreferences,
  readVocabulary,
  removeHistory,
  toggleFavorite,
  toggleVocabulary,
  writePreferences,
  type ReaderPreferences,
} from "./readerStorage.js";
import { isStandaloneReader, type BeforeInstallPromptEvent } from "./pwa.js";

type LibraryState =
  | { status: "loading"; items: ReaderLibraryItem[] }
  | { status: "ready"; items: ReaderLibraryItem[] }
  | { status: "error"; items: ReaderLibraryItem[] };

type NavigationKey =
  "home" | "library" | "favorites" | "history" | "vocabulary" | "settings" | "documentation";

const NAVIGATION: ReadonlyArray<{
  key: NavigationKey;
  href: string;
  label: string;
  icon: string;
}> = [
  { key: "home", href: "/", label: "Inicio", icon: "⌂" },
  { key: "library", href: "/library", label: "Biblioteca", icon: "▤" },
  { key: "favorites", href: "/favorites", label: "Favoritos", icon: "♡" },
  { key: "history", href: "/history", label: "Historial", icon: "↺" },
  { key: "vocabulary", href: "/vocabulary", label: "Vocabulario", icon: "Aa" },
  { key: "settings", href: "/settings", label: "Ajustes", icon: "⚙" },
];

const useLibrary = (): LibraryState => {
  const [state, setState] = useState<LibraryState>({ status: "loading", items: [] });

  useEffect(() => {
    let active = true;
    void getReaderLibrary()
      .then((items) => {
        if (active) {
          setState({ status: "ready", items });
        }
      })
      .catch(() => {
        if (active) {
          setState({ status: "error", items: [] });
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
};

/**
 * Shared application shell for every Reader screen except the distraction-free reading room.
 *
 * Wide screens use a navigation rail and compact screens use bottom navigation. The same links and
 * labels are rendered in both forms so route meaning does not depend on viewport width.
 */
export const ReaderShell = ({
  active,
  children,
}: {
  active: NavigationKey;
  children: ReactNode;
}) => {
  const [online, setOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const preferences = readPreferences(window.localStorage);

  useEffect(() => {
    document.documentElement.dataset["readerTheme"] = preferences.theme;
    document.documentElement.dataset["readerMode"] = preferences.mode;
    document.documentElement.style.setProperty(
      "--reader-font-scale",
      String(preferences.fontScale),
    );
    document.documentElement.classList.toggle("reader-reduced-motion", preferences.reduceMotion);
  }, [preferences.fontScale, preferences.mode, preferences.reduceMotion, preferences.theme]);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
    };
    const handleOffline = () => {
      setOnline(false);
    };
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstallPrompt(null);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("beforeinstallprompt", handleInstall);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleInstall);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const install = async () => {
    if (installPrompt === null) {
      return;
    }
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const navigation = (
    <nav aria-label="Navegación principal">
      {NAVIGATION.map((item) => (
        <a
          className={active === item.key ? "nav-item nav-item--active" : "nav-item"}
          href={item.href}
          aria-current={active === item.key ? "page" : undefined}
          key={item.key}
        >
          <span aria-hidden="true">{item.icon}</span>
          <strong>{item.label}</strong>
        </a>
      ))}
    </nav>
  );

  return (
    <div className="reader-app">
      <a className="skip-link" href="#reader-main">
        Saltar al contenido
      </a>
      <aside className="reader-rail">
        <a className="reader-brand reader-brand--rail" href="/" aria-label="FollowRead, inicio">
          <span aria-hidden="true">F</span>
          <strong>FollowRead</strong>
        </a>
        {navigation}
        <a className="rail-help" href="/documentation">
          Ayuda y documentación
        </a>
      </aside>

      <div className="reader-stage">
        <header className="app-header">
          <a className="reader-brand reader-brand--compact" href="/">
            <span aria-hidden="true">F</span>
            <strong>FollowRead</strong>
          </a>
          <div className="header-actions">
            <span
              className={online ? "connection-chip" : "connection-chip connection-chip--offline"}
            >
              <span aria-hidden="true">{online ? "●" : "○"}</span>
              {online ? "En línea" : "Sin conexión"}
            </span>
            {installPrompt !== null && !isStandaloneReader() ? (
              <button className="quiet-button" type="button" onClick={() => void install()}>
                Instalar app
              </button>
            ) : null}
            <a className="mode-chip" href="/settings">
              {modeLabel(preferences.mode)}
            </a>
          </div>
        </header>
        <main id="reader-main" className="app-main" tabIndex={-1}>
          {children}
        </main>
        <div className="reader-bottom-nav">{navigation}</div>
      </div>
    </div>
  );
};

export const HomePage = () => {
  const library = useLibrary();
  const history = readHistory(window.localStorage);
  const lastRead = history[0];
  const featured = library.items[0];
  const continueItem =
    lastRead === undefined
      ? undefined
      : library.items.find((item) => item.package.slug === lastRead.slug);

  return (
    <ReaderShell active="home">
      <section className="page-heading page-heading--home">
        <div>
          <p className="eyebrow">Tu espacio de lectura</p>
          <h1>Hola, ¿qué quieres leer hoy?</h1>
          <p>Historias accesibles que recuerdan tu ritmo y tus preferencias.</p>
        </div>
        <a className="secondary-action" href="/library">
          Explorar biblioteca
        </a>
      </section>

      {library.status === "loading" ? <LoadingState label="Preparando tus lecturas…" /> : null}
      {library.status === "error" ? <LibraryError /> : null}

      {library.status === "ready" && continueItem !== undefined && lastRead !== undefined ? (
        <section className="continue-section" aria-labelledby="continue-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Continúa donde quedaste</p>
              <h2 id="continue-title">{lastRead.title}</h2>
            </div>
            <span>{progressPercent(lastRead.positionMs, lastRead.durationMs)}% completado</span>
          </div>
          <article className="continue-card">
            <img
              src={continueItem.package.cover_uri ?? fallbackCover(continueItem.package.slug)}
              alt={continueItem.package.cover_alt_text ?? ""}
            />
            <div>
              <span>{lastRead.chapterTitle ?? "Lectura en progreso"}</span>
              <div
                className="completion-track"
                role="progressbar"
                aria-label="Progreso de lectura"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent(lastRead.positionMs, lastRead.durationMs)}
              >
                <i
                  style={{
                    width: `${String(progressPercent(lastRead.positionMs, lastRead.durationMs))}%`,
                  }}
                />
              </div>
              <a className="primary-action" href={`/read/${continueItem.package.slug}`}>
                Continuar leyendo <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        </section>
      ) : null}

      {library.status === "ready" && featured !== undefined ? (
        <section className="featured-section" aria-labelledby="featured-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Historia destacada</p>
              <h2 id="featured-title">Una aventura para esta noche</h2>
            </div>
            <a href="/library">Ver todo</a>
          </div>
          <StoryCard item={featured} />
        </section>
      ) : null}

      <section className="mode-overview" aria-labelledby="modes-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Una app, tres experiencias</p>
            <h2 id="modes-title">Lee de la manera que te resulte cómoda</h2>
          </div>
        </div>
        <div className="mode-grid">
          <ModeSummary icon="☀" title="Infantil" text="Texto grande y controles esenciales." />
          <ModeSummary icon="☾" title="Adulto" text="Lectura sobria para sesiones largas." />
          <ModeSummary
            icon="Aa"
            title="Aprender inglés"
            text="Traducción y vocabulario contextual."
          />
        </div>
      </section>
    </ReaderShell>
  );
};

export const LibraryPage = () => {
  const library = useLibrary();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [language, setLanguage] = useState("all");
  const [level, setLevel] = useState("all");

  const categories = useMemo(
    () => [
      ...new Map(
        library.items.flatMap((item) =>
          item.catalog.categories.map((value) => [value.slug, value] as const),
        ),
      ).values(),
    ],
    [library.items],
  );

  const levels = useMemo(
    () => [
      ...new Map(
        library.items.map(
          (item) => [item.catalog.reading_level.code, item.catalog.reading_level] as const,
        ),
      ).values(),
    ],
    [library.items],
  );

  const filtered = library.items.filter((item) => {
    const translation = preferredTranslation(item);
    const searchable = normalize(
      `${translation?.title ?? ""} ${translation?.summary ?? ""} ${item.catalog.categories
        .map((value) => value.name)
        .join(" ")}`,
    );
    return (
      searchable.includes(normalize(query)) &&
      (category === "all" || item.catalog.categories.some((value) => value.slug === category)) &&
      (language === "all" || item.catalog.languages.includes(language as "es" | "en")) &&
      (level === "all" || item.catalog.reading_level.code === level)
    );
  });

  return (
    <ReaderShell active="library">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h1>Encuentra tu próxima lectura</h1>
          <p>Busca por título o combina categoría, idioma y nivel.</p>
        </div>
        <span className="result-count">
          {library.status === "ready"
            ? `${String(filtered.length)} de ${String(library.items.length)}`
            : "Cargando"}
        </span>
      </section>

      <section className="filter-panel" aria-label="Filtros de biblioteca">
        <label className="search-field">
          <span>Buscar</span>
          <input
            type="search"
            value={query}
            placeholder="Título, tema o categoría"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
        </label>
        <label>
          <span>Idioma</span>
          <select
            value={language}
            onChange={(event) => {
              setLanguage(event.target.value);
            }}
          >
            <option value="all">Todos</option>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          <span>Nivel</span>
          <select
            value={level}
            onChange={(event) => {
              setLevel(event.target.value);
            }}
          >
            <option value="all">Todos</option>
            {levels.map((value) => (
              <option value={value.code} key={value.code}>
                {value.label}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="category-chips" aria-label="Categorías">
        <button
          className={category === "all" ? "active" : ""}
          type="button"
          aria-pressed={category === "all"}
          onClick={() => {
            setCategory("all");
          }}
        >
          Todas
        </button>
        {categories.map((value) => (
          <button
            className={category === value.slug ? "active" : ""}
            type="button"
            aria-pressed={category === value.slug}
            onClick={() => {
              setCategory(value.slug);
            }}
            key={value.slug}
          >
            {value.name}
          </button>
        ))}
      </div>

      {library.status === "loading" ? <LoadingState label="Consultando el catálogo…" /> : null}
      {library.status === "error" ? <LibraryError /> : null}
      {library.status === "ready" && filtered.length === 0 ? (
        <EmptyState
          icon="⌕"
          title="No encontramos lecturas"
          text="Prueba otra palabra o quita uno de los filtros."
          action={
            <button
              className="secondary-action"
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("all");
                setLanguage("all");
                setLevel("all");
              }}
            >
              Limpiar filtros
            </button>
          }
        />
      ) : null}
      {library.status === "ready" && filtered.length > 0 ? (
        <section className="library-card-grid" aria-label="Resultados">
          {filtered.map((item) => (
            <StoryCard item={item} compact key={item.package.slug} />
          ))}
        </section>
      ) : null}
    </ReaderShell>
  );
};

export const DetailPage = ({ slug }: { slug: string }) => {
  const library = useLibrary();
  const item = library.items.find((value) => value.package.slug === slug);
  const [favorite, setFavorite] = useState(() => readFavorites(window.localStorage).includes(slug));
  const history = readHistory(window.localStorage).find((entry) => entry.slug === slug);

  if (library.status === "loading") {
    return (
      <ReaderShell active="library">
        <LoadingState label="Preparando los detalles…" />
      </ReaderShell>
    );
  }
  if (library.status === "error" || item === undefined) {
    return (
      <ReaderShell active="library">
        <EmptyState
          icon="!"
          title="Esta lectura no está disponible"
          text="El catálogo sigue intacto. Vuelve a la biblioteca e inténtalo de nuevo."
          action={
            <a className="primary-action" href="/library">
              Volver a la biblioteca
            </a>
          }
        />
      </ReaderShell>
    );
  }

  const translation = preferredTranslation(item);
  if (translation === undefined) {
    return null;
  }

  return (
    <ReaderShell active="library">
      <a className="back-link" href="/library">
        ← Volver a la biblioteca
      </a>
      <article className="detail-layout">
        <div className="detail-cover">
          <img
            src={item.package.cover_uri ?? fallbackCover(item.package.slug)}
            alt={item.package.cover_alt_text ?? ""}
          />
        </div>
        <div className="detail-copy">
          <p className="eyebrow">{item.catalog.content_type === "story" ? "Cuento" : "Lectura"}</p>
          <h1>{translation.title}</h1>
          <p className="detail-summary">{translation.summary}</p>
          <dl className="detail-facts">
            <div>
              <dt>Nivel</dt>
              <dd>{item.catalog.reading_level.label}</dd>
            </div>
            <div>
              <dt>Idiomas</dt>
              <dd>{item.catalog.languages.map(languageLabel).join(" · ")}</dd>
            </div>
            <div>
              <dt>Capítulos</dt>
              <dd>{translation.chapters.length}</dd>
            </div>
            <div>
              <dt>Disponible</dt>
              <dd>En línea</dd>
            </div>
          </dl>
          <div className="story-tags">
            {item.catalog.categories.map((value) => (
              <span key={value.slug}>{value.name}</span>
            ))}
          </div>
          {history !== undefined ? (
            <div className="detail-progress">
              <strong>
                Tu progreso: {progressPercent(history.positionMs, history.durationMs)}%
              </strong>
              <div className="completion-track" aria-hidden="true">
                <i
                  style={{
                    width: `${String(progressPercent(history.positionMs, history.durationMs))}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
          <div className="detail-actions">
            <a className="primary-action" href={`/read/${item.package.slug}`}>
              {history === undefined ? "Comenzar a leer" : "Continuar leyendo"}{" "}
              <span aria-hidden="true">→</span>
            </a>
            <button
              className="secondary-action"
              type="button"
              aria-pressed={favorite}
              onClick={() => {
                setFavorite(toggleFavorite(window.localStorage, item.package.slug));
              }}
            >
              {favorite ? "♥ En favoritos" : "♡ Guardar"}
            </button>
          </div>
        </div>
      </article>
    </ReaderShell>
  );
};

export const FavoritesPage = () => {
  const library = useLibrary();
  const [favorites, setFavorites] = useState(() => readFavorites(window.localStorage));
  const items = library.items.filter((item) => favorites.includes(item.package.slug));

  return (
    <ReaderShell active="favorites">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Mi lectura</p>
          <h1>Favoritos</h1>
          <p>Las historias que quieres tener siempre a mano.</p>
        </div>
      </section>
      {library.status === "loading" ? <LoadingState label="Buscando tus favoritos…" /> : null}
      {library.status === "error" ? <LibraryError /> : null}
      {library.status === "ready" && items.length === 0 ? (
        <EmptyState
          icon="♡"
          title="Todavía no guardaste favoritos"
          text="Abre una lectura y usa Guardar para verla aquí."
          action={
            <a className="primary-action" href="/library">
              Explorar biblioteca
            </a>
          }
        />
      ) : null}
      {items.length > 0 ? (
        <section className="library-card-grid" aria-label="Lecturas favoritas">
          {items.map((item) => (
            <StoryCard
              item={item}
              compact
              onFavoriteChange={() => {
                setFavorites(readFavorites(window.localStorage));
              }}
              key={item.package.slug}
            />
          ))}
        </section>
      ) : null}
    </ReaderShell>
  );
};

export const HistoryPage = () => {
  const [history, setHistory] = useState(() => readHistory(window.localStorage));

  return (
    <ReaderShell active="history">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Mi lectura</p>
          <h1>Historial</h1>
          <p>Reanuda tus lecturas recientes sin buscar la última página.</p>
        </div>
      </section>
      {history.length === 0 ? (
        <EmptyState
          icon="↺"
          title="Tu historial está vacío"
          text="Cuando comiences un cuento aparecerá aquí con su progreso."
          action={
            <a className="primary-action" href="/library">
              Elegir una lectura
            </a>
          }
        />
      ) : (
        <section className="history-list" aria-label="Lecturas recientes">
          {history.map((entry) => (
            <article className="history-card" key={entry.slug}>
              <img src={entry.coverUri ?? fallbackCover(entry.slug)} alt="" />
              <div>
                <span>{entry.chapterTitle ?? "Lectura en progreso"}</span>
                <h2>{entry.title}</h2>
                <div className="completion-track" aria-hidden="true">
                  <i
                    style={{
                      width: `${String(progressPercent(entry.positionMs, entry.durationMs))}%`,
                    }}
                  />
                </div>
                <p>
                  {progressPercent(entry.positionMs, entry.durationMs)}% ·{" "}
                  {new Date(entry.updatedAt).toLocaleDateString("es")}
                </p>
              </div>
              <div className="history-actions">
                <a className="primary-action" href={`/read/${entry.slug}`}>
                  Reanudar
                </a>
                <button
                  className="quiet-button"
                  type="button"
                  onClick={() => {
                    removeHistory(window.localStorage, entry.slug);
                    setHistory(readHistory(window.localStorage));
                  }}
                >
                  Quitar
                </button>
              </div>
            </article>
          ))}
        </section>
      )}
    </ReaderShell>
  );
};

export const VocabularyPage = () => {
  const [entries, setEntries] = useState(() => readVocabulary(window.localStorage));

  return (
    <ReaderShell active="vocabulary">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Aprender inglés</p>
          <h1>Mi vocabulario</h1>
          <p>Palabras que guardaste mientras leías en modo aprendizaje.</p>
        </div>
        <a className="secondary-action" href="/settings">
          Activar modo aprendizaje
        </a>
      </section>
      {entries.length === 0 ? (
        <EmptyState
          icon="Aa"
          title="Aún no guardaste palabras"
          text="En el lector, toca una palabra inglesa para ver su traducción y guardarla."
          action={
            <a className="primary-action" href="/library">
              Abrir una lectura
            </a>
          }
        />
      ) : (
        <section className="vocabulary-grid" aria-label="Palabras guardadas">
          {entries.map((entry) => (
            <article className="vocabulary-card" key={entry.id}>
              <span>{entry.language === "en" ? "English" : "Español"}</span>
              <h2 lang={entry.language}>{entry.word}</h2>
              <p>{entry.translation}</p>
              <button
                className="quiet-button"
                type="button"
                onClick={() => {
                  toggleVocabulary(window.localStorage, entry);
                  setEntries(readVocabulary(window.localStorage));
                }}
              >
                Quitar
              </button>
            </article>
          ))}
        </section>
      )}
    </ReaderShell>
  );
};

export const SettingsPage = () => {
  const [preferences, setPreferences] = useState(() => readPreferences(window.localStorage));

  const update = (next: ReaderPreferences) => {
    setPreferences(next);
    writePreferences(window.localStorage, next);
  };

  useEffect(() => {
    document.documentElement.dataset["readerTheme"] = preferences.theme;
    document.documentElement.dataset["readerMode"] = preferences.mode;
    document.documentElement.style.setProperty(
      "--reader-font-scale",
      String(preferences.fontScale),
    );
    document.documentElement.classList.toggle("reader-reduced-motion", preferences.reduceMotion);
  }, [preferences]);

  return (
    <ReaderShell active="settings">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Preferencias locales</p>
          <h1>Ajusta tu experiencia</h1>
          <p>No necesitas una cuenta. Estas opciones se guardan sólo en este dispositivo.</p>
        </div>
      </section>

      <div className="settings-layout">
        <form className="settings-form">
          <fieldset>
            <legend>Modo de lectura</legend>
            <div className="mode-selector">
              {(["children", "adult", "learning"] as const).map((mode) => (
                <label className={preferences.mode === mode ? "selected" : ""} key={mode}>
                  <input
                    type="radio"
                    name="reading-mode"
                    value={mode}
                    checked={preferences.mode === mode}
                    onChange={() => {
                      update(preferencesForMode(mode, preferences));
                    }}
                  />
                  <strong>{modeLabel(mode)}</strong>
                  <span>{modeDescription(mode)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="settings-grid">
            <legend>Presentación</legend>
            <label>
              <span>Tema</span>
              <select
                value={preferences.theme}
                onChange={(event) => {
                  update({
                    ...preferences,
                    theme: event.target.value as ReaderPreferences["theme"],
                  });
                }}
              >
                <option value="system">Usar el sistema</option>
                <option value="light">Claro</option>
                <option value="dark">Oscuro</option>
              </select>
            </label>
            <label>
              <span>Tamaño del texto: {Math.round(preferences.fontScale * 100)}%</span>
              <input
                type="range"
                min="0.85"
                max="1.5"
                step="0.05"
                value={preferences.fontScale}
                onChange={(event) => {
                  update({ ...preferences, fontScale: Number(event.target.value) });
                }}
              />
            </label>
            <SwitchSetting
              label="Mostrar mano indicadora"
              description="Señala la palabra activa sin mover el foco."
              checked={preferences.showPointer}
              onChange={(checked) => {
                update({ ...preferences, showPointer: checked });
              }}
            />
            <SwitchSetting
              label="Auto-scroll"
              description="Mantiene la palabra activa dentro de la vista."
              checked={preferences.autoScroll}
              onChange={(checked) => {
                update({ ...preferences, autoScroll: checked });
              }}
            />
            <SwitchSetting
              label="Reducir movimiento"
              description="Elimina desplazamientos y animaciones decorativas."
              checked={preferences.reduceMotion}
              onChange={(checked) => {
                update({ ...preferences, reduceMotion: checked });
              }}
            />
          </fieldset>

          <fieldset className="settings-grid">
            <legend>Lectura y voz</legend>
            <label>
              <span>Idioma inicial</span>
              <select
                value={preferences.defaultLanguage}
                onChange={(event) => {
                  update({
                    ...preferences,
                    defaultLanguage: event.target.value as "es" | "en",
                  });
                }}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
              </select>
            </label>
            <label>
              <span>Velocidad inicial</span>
              <select
                value={preferences.playbackRate}
                onChange={(event) => {
                  update({ ...preferences, playbackRate: Number(event.target.value) });
                }}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <option value={rate} key={rate}>
                    {rate}×
                  </option>
                ))}
              </select>
            </label>
            <SwitchSetting
              label="Narración del dispositivo"
              description="Usa una voz instalada en el navegador; no envía el texto a una API."
              checked={preferences.narrationEnabled}
              onChange={(checked) => {
                update({ ...preferences, narrationEnabled: checked });
              }}
            />
          </fieldset>

          <button
            className="quiet-button"
            type="button"
            onClick={() => {
              update(DEFAULT_READER_PREFERENCES);
            }}
          >
            Restaurar valores iniciales
          </button>
        </form>

        <aside className="settings-preview" aria-label="Vista previa">
          <p className="eyebrow">Vista previa</p>
          <h2>{modeLabel(preferences.mode)}</h2>
          <p style={{ fontSize: `${String(preferences.fontScale)}em` }}>
            La luna iluminaba el sendero y cada palabra encontraba su lugar.
          </p>
          <div>
            <span className="preview-highlight">palabra</span>
            {preferences.showPointer ? <span aria-hidden="true"> ← mano visible</span> : null}
          </div>
          <small>
            Tema {preferences.theme} · {preferences.defaultLanguage.toUpperCase()} ·{" "}
            {preferences.playbackRate}×
          </small>
        </aside>
      </div>
    </ReaderShell>
  );
};

export const DocumentationPage = () => (
  <ReaderShell active="documentation">
    <article className="docs-card" aria-labelledby="docs-title">
      <p className="eyebrow">Ayuda para desarrollo</p>
      <h1 id="docs-title">Documentación de FollowRead</h1>
      <h2>Preparar el proyecto en Windows</h2>
      <ol>
        <li>Instala Node.js 24 y abre una nueva terminal de PowerShell.</li>
        <li>
          Ejecuta <code>npm install --global pnpm@11.9.0</code>.
        </li>
        <li>
          En <code>C:\Projects\FollowRead</code>, ejecuta <code>pnpm setup</code>.
        </li>
      </ol>
      <h2>Levantar el cuento demo</h2>
      <p>
        Ejecuta <code>pnpm demo:seed</code> una vez y luego <code>pnpm dev</code>. Reader usa SQLite
        y puede narrar con una voz del dispositivo, sin credenciales externas.
      </p>
      <h2>Rutas principales</h2>
      <ul>
        <li>
          <a href="/library">Biblioteca</a>
        </li>
        <li>
          <a href="/settings">Modos y configuración</a>
        </li>
        <li>
          <a href="/vocabulary">Vocabulario</a>
        </li>
      </ul>
      <a className="text-link" href="http://localhost:8000/docs">
        Abrir documentación de la API
      </a>
    </article>
  </ReaderShell>
);

const StoryCard = ({
  item,
  compact = false,
  onFavoriteChange,
}: {
  item: ReaderLibraryItem;
  compact?: boolean;
  onFavoriteChange?: () => void;
}) => {
  const translation = preferredTranslation(item);
  const [favorite, setFavorite] = useState(() =>
    readFavorites(window.localStorage).includes(item.package.slug),
  );
  if (translation === undefined) {
    return null;
  }
  return (
    <article className={compact ? "content-card content-card--compact" : "content-card"}>
      <a className="content-card__cover" href={`/details/${item.package.slug}`}>
        <img
          src={item.package.cover_uri ?? fallbackCover(item.package.slug)}
          alt={item.package.cover_alt_text ?? ""}
        />
      </a>
      <div className="content-card__body">
        <div className="story-meta">
          <span>{item.catalog.categories[0]?.name ?? "Lectura"}</span>
          <span>{item.catalog.reading_level.label}</span>
        </div>
        <h3>
          <a href={`/details/${item.package.slug}`}>{translation.title}</a>
        </h3>
        <p>{translation.summary}</p>
        <div className="story-tags">
          {item.catalog.languages.map((language) => (
            <span key={language}>{languageLabel(language)}</span>
          ))}
        </div>
        <div className="card-actions">
          <a className="primary-action" href={`/details/${item.package.slug}`}>
            Ver detalles
          </a>
          <button
            className="favorite-button"
            type="button"
            aria-label={
              favorite ? `Quitar ${translation.title} de favoritos` : `Guardar ${translation.title}`
            }
            aria-pressed={favorite}
            onClick={() => {
              setFavorite(toggleFavorite(window.localStorage, item.package.slug));
              onFavoriteChange?.();
            }}
          >
            <span aria-hidden="true">{favorite ? "♥" : "♡"}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

const LoadingState = ({ label }: { label: string }) => (
  <div className="state-panel" role="status">
    <span className="state-symbol state-symbol--loading" aria-hidden="true">
      F
    </span>
    <p>{label}</p>
  </div>
);

const LibraryError = () => (
  <div className="state-panel state-panel--error" role="alert">
    <span className="state-symbol" aria-hidden="true">
      !
    </span>
    <h2>No pudimos abrir la biblioteca</h2>
    <p>Tu progreso local se conserva. Comprueba que la API siga activa y vuelve a intentarlo.</p>
    <button
      className="secondary-action"
      type="button"
      onClick={() => {
        window.location.reload();
      }}
    >
      Reintentar
    </button>
  </div>
);

const EmptyState = ({
  icon,
  title,
  text,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  action: ReactNode;
}) => (
  <section className="state-panel state-panel--empty">
    <span className="state-symbol" aria-hidden="true">
      {icon}
    </span>
    <h2>{title}</h2>
    <p>{text}</p>
    {action}
  </section>
);

const ModeSummary = ({ icon, title, text }: { icon: string; title: string; text: string }) => (
  <article>
    <span aria-hidden="true">{icon}</span>
    <h3>{title}</h3>
    <p>{text}</p>
  </article>
);

const SwitchSetting = ({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="switch-setting">
    <span>
      <strong>{label}</strong>
      <small>{description}</small>
    </span>
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(event) => {
        onChange(event.target.checked);
      }}
    />
  </label>
);

const preferredTranslation = (item: ReaderLibraryItem): ReaderTranslation | undefined =>
  item.package.translations.find((translation) => translation.language === "es") ??
  item.package.translations[0];

const fallbackCover = (slug: string) => `/stories/${slug}-cover.png`;

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase()
    .trim();

const progressPercent = (positionMs: number, durationMs: number) =>
  durationMs <= 0 ? 0 : Math.min(100, Math.round((positionMs / durationMs) * 100));

const languageLabel = (language: "es" | "en") => (language === "es" ? "Español" : "English");

const modeLabel = (mode: ReaderPreferences["mode"]) => {
  if (mode === "children") {
    return "Modo infantil";
  }
  if (mode === "learning") {
    return "Aprender inglés";
  }
  return "Modo adulto";
};

const modeDescription = (mode: ReaderPreferences["mode"]) => {
  if (mode === "children") {
    return "Grande, claro y con pocos controles.";
  }
  if (mode === "learning") {
    return "Inglés, traducción y vocabulario.";
  }
  return "Sobrio, configurable y cómodo.";
};
