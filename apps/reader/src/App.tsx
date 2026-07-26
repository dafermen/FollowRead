import {
  ReaderEngine,
  type ReaderEngineState,
  type ReaderTimeline,
} from "@followread/reader-engine";
import { useEffect, useMemo, useRef, useState } from "react";

import { getReaderPackage, type ReaderPackage, type ReaderTranslation } from "./readerClient.js";

const STORY_SLUG = "el-zorro-y-la-luna";

const Documentation = () => (
  <main className="documentation">
    <article className="docs-card" aria-labelledby="docs-title">
      <a className="back-link" href="/">
        ← Volver al Reader
      </a>
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
      <h2>Levantar y preparar el cuento demo</h2>
      <p>
        Ejecuta <code>pnpm demo:seed</code> una vez y luego <code>pnpm dev</code>. El Reader usa
        audio local simulado, por lo que no necesita credenciales ni servicios externos.
      </p>
      <a className="text-link" href="http://localhost:8000/docs">
        Abrir documentación de la API
      </a>
    </article>
  </main>
);

const ReaderHome = () => {
  const [story, setStory] = useState<ReaderPackage | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    void getReaderPackage()
      .then((loaded) => {
        if (active) {
          setStory(loaded);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const spanish = story?.translations.find((item) => item.language === "es");
  return (
    <main className="reader-home">
      <header className="reader-nav">
        <a className="reader-brand" href="/">
          <span aria-hidden="true">F</span>
          <strong>FollowRead</strong>
        </a>
        <a href="/documentation">Ayuda</a>
      </header>

      <section className="library-hero">
        <div>
          <p className="eyebrow">Primera lectura funcional</p>
          <h1>Historias que avanzan contigo.</h1>
          <p>Lee a tu ritmo mientras FollowRead señala cada palabra y conserva tu progreso.</p>
        </div>
        <span className="library-count">{status === "ready" ? "1 historia" : "Biblioteca"}</span>
      </section>

      {status === "loading" ? (
        <div className="reader-message" role="status">
          Preparando la biblioteca…
        </div>
      ) : status === "error" || story === null || spanish === undefined ? (
        <div className="reader-message reader-message--error" role="alert">
          El cuento demo aún no está sembrado. Ejecuta <code>pnpm demo:seed</code>.
        </div>
      ) : (
        <section className="story-grid" aria-label="Biblioteca">
          <article className="story-card">
            <img
              src={story.cover_uri ?? "/stories/el-zorro-y-la-luna-cover.png"}
              alt={story.cover_alt_text ?? ""}
            />
            <div className="story-card__content">
              <div className="story-meta">
                <span>Cuento bilingüe</span>
                <span>6 minutos</span>
              </div>
              <h2>{spanish.title}</h2>
              <p>{spanish.summary}</p>
              <div className="story-tags">
                <span>Español</span>
                <span>English</span>
                <span>Inicial</span>
              </div>
              <a className="primary-action" href={`/read/${story.slug}`}>
                Comenzar a leer <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        </section>
      )}
    </main>
  );
};

const StoryReader = () => {
  const engine = useMemo(() => new ReaderEngine(), []);
  const [story, setStory] = useState<ReaderPackage | null>(null);
  const [language, setLanguage] = useState<"es" | "en">("es");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [engineState, setEngineState] = useState<ReaderEngineState>(engine.getState());

  useEffect(() => engine.subscribe(setEngineState), [engine]);
  useEffect(() => {
    let active = true;
    void getReaderPackage()
      .then((loaded) => {
        if (active) {
          setStory(loaded);
          setLoadState("ready");
        }
      })
      .catch(() => {
        if (active) {
          setLoadState("error");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const translation = story?.translations.find((item) => item.language === language);
  useEffect(() => {
    if (translation === undefined || story === null) {
      return;
    }
    const recovered = readProgress(story.slug, language);
    engine.load(toTimeline(translation), recovered);
  }, [engine, language, story, translation]);

  useEffect(() => {
    if (engineState.status !== "playing") {
      return;
    }
    const timer = window.setInterval(() => {
      engine.tick(100);
    }, 100);
    return () => {
      window.clearInterval(timer);
    };
  }, [engine, engineState.status]);

  useEffect(() => {
    if (story !== null && engineState.durationMs > 0) {
      window.localStorage.setItem(
        progressKey(story.slug, language),
        JSON.stringify(engine.getProgress()),
      );
    }
  }, [engine, engineState.currentTimeMs, engineState.durationMs, language, story]);

  useEffect(() => {
    const handleViewport = () => {
      engine.handleViewportChange();
    };
    const handleInterruption = () => {
      engine.handleInterruption();
    };
    window.addEventListener("resize", handleViewport);
    window.addEventListener("orientationchange", handleViewport);
    window.addEventListener("blur", handleInterruption);
    return () => {
      window.removeEventListener("resize", handleViewport);
      window.removeEventListener("orientationchange", handleViewport);
      window.removeEventListener("blur", handleInterruption);
    };
  }, [engine]);

  const activeMarkRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    activeMarkRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [engineState.activeMarkIndex, engineState.layoutRevision]);

  if (loadState !== "ready" || story === null || translation === undefined) {
    return (
      <main className="reader-loading" aria-live="polite">
        <span aria-hidden="true">{loadState === "error" ? "!" : "F"}</span>
        <h1>{loadState === "error" ? "No pudimos abrir el cuento" : "Preparando la lectura…"}</h1>
        {loadState === "error" ? <a href="/">Volver a la biblioteca</a> : null}
      </main>
    );
  }

  const chapter = translation.chapters[engineState.activeChapterIndex] ?? translation.chapters[0];
  const percentage =
    engineState.durationMs === 0
      ? 0
      : Math.round((engineState.currentTimeMs / engineState.durationMs) * 100);

  return (
    <main className="reading-room">
      <header className="reading-header">
        <a href="/" aria-label="Volver a la biblioteca">
          ←
        </a>
        <div>
          <strong>{translation.title}</strong>
          <span>
            Capítulo {engineState.activeChapterIndex + 1} de {translation.chapters.length}
          </span>
        </div>
        <div className="language-toggle" aria-label="Idioma de lectura">
          <button
            className={language === "es" ? "active" : ""}
            type="button"
            aria-pressed={language === "es"}
            onClick={() => {
              setLanguage("es");
            }}
          >
            ES
          </button>
          <button
            className={language === "en" ? "active" : ""}
            type="button"
            aria-pressed={language === "en"}
            onClick={() => {
              setLanguage("en");
            }}
          >
            EN
          </button>
        </div>
      </header>

      <div className="reading-layout">
        <aside className="story-visual">
          <img
            src={story.cover_uri ?? "/stories/el-zorro-y-la-luna-cover.png"}
            alt={story.cover_alt_text ?? ""}
          />
          <div>
            <span>Audio local</span>
            <strong>{translation.audio.voice_id}</strong>
          </div>
        </aside>

        <article className="reading-page" aria-live="polite">
          <p className="eyebrow">Capítulo {engineState.activeChapterIndex + 1}</p>
          <h1>{chapter?.title}</h1>
          <div className="story-copy">
            {chapter?.paragraphs.map((paragraph) => (
              <p key={paragraph.stable_key}>
                {translation.audio.marks
                  .map((mark, index) => ({ mark, index }))
                  .filter(({ mark }) => mark.paragraph_key === paragraph.stable_key)
                  .map(({ mark, index }) => {
                    const active = index === engineState.activeMarkIndex;
                    return (
                      <span
                        className={active ? "story-word story-word--active" : "story-word"}
                        ref={active ? activeMarkRef : undefined}
                        key={`${paragraph.stable_key}-${String(index)}`}
                      >
                        {active ? <ReadingHand /> : null}
                        {mark.value}{" "}
                      </span>
                    );
                  })}
              </p>
            ))}
          </div>
        </article>
      </div>

      <section className="reader-controls" aria-label="Controles de lectura">
        <div className="progress-row">
          <span>{formatTime(engineState.currentTimeMs)}</span>
          <label>
            <span className="visually-hidden">Posición de lectura</span>
            <input
              type="range"
              min={0}
              max={engineState.durationMs}
              value={engineState.currentTimeMs}
              onChange={(event) => {
                engine.seek(Number(event.target.value));
              }}
            />
          </label>
          <span>{formatTime(engineState.durationMs)}</span>
          <strong>{percentage}%</strong>
        </div>
        <div className="control-row">
          <button
            type="button"
            aria-label="Capítulo anterior"
            onClick={() => {
              engine.changeChapter(-1);
            }}
          >
            |←
          </button>
          <button
            type="button"
            aria-label="Retroceder cinco segundos"
            onClick={() => {
              engine.skip(-5000);
            }}
          >
            −5
          </button>
          <button
            className="play-control"
            type="button"
            aria-label={engineState.status === "playing" ? "Pausar" : "Reproducir"}
            onClick={() => {
              engine.toggle();
            }}
          >
            {engineState.status === "playing" ? "Ⅱ" : "▶"}
          </button>
          <button
            type="button"
            aria-label="Avanzar cinco segundos"
            onClick={() => {
              engine.skip(5000);
            }}
          >
            +5
          </button>
          <button
            type="button"
            aria-label="Capítulo siguiente"
            onClick={() => {
              engine.changeChapter(1);
            }}
          >
            →|
          </button>
          <button
            type="button"
            aria-label="Repetir palabra"
            onClick={() => {
              engine.repeatActiveWord();
            }}
          >
            ↻ Palabra
          </button>
          <label className="speed-control">
            <span>Velocidad</span>
            <select
              value={engineState.playbackRate}
              onChange={(event) => {
                engine.setPlaybackRate(Number(event.target.value));
              }}
            >
              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                <option value={rate} key={rate}>
                  {rate}×
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="playback-note" role="status">
          {engineState.status === "playing"
            ? `Leyendo: ${engine.getActiveMark()?.value ?? "preparando palabra"}`
            : "Lectura pausada · tu progreso se guarda automáticamente"}
        </p>
      </section>
    </main>
  );
};

const ReadingHand = () => (
  <svg className="reading-hand" viewBox="0 0 38 30" aria-hidden="true">
    <path
      d="M3 15h18l-5-5 3-3 12 10-12 10-3-3 5-5H3z"
      fill="currentColor"
      stroke="currentColor"
      strokeLinejoin="round"
    />
  </svg>
);

const toTimeline = (translation: ReaderTranslation): ReaderTimeline => ({
  durationMs: translation.audio.duration_ms,
  chapters: translation.chapters.map((chapter) => ({
    stableKey: chapter.stable_key,
    title: chapter.title,
    paragraphKeys: chapter.paragraphs.map((paragraph) => paragraph.stable_key),
  })),
  marks: translation.audio.marks.map((mark) => ({
    value: mark.value,
    startMs: mark.start_ms,
    endMs: mark.end_ms,
    charStart: mark.char_start,
    charEnd: mark.char_end,
    paragraphKey: mark.paragraph_key,
    chapterKey: mark.chapter_key,
  })),
});

const progressKey = (slug: string, language: string) => `followread-progress-${slug}-${language}`;

const readProgress = (slug: string, language: string) => {
  const stored = window.localStorage.getItem(progressKey(slug, language));
  if (stored === null) {
    return undefined;
  }
  try {
    return JSON.parse(stored) as {
      positionMs: number;
      stableAnchor: string | null;
      chapterKey: string | null;
    };
  } catch {
    return undefined;
  }
};

const formatTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  return `${String(Math.floor(totalSeconds / 60))}:${String(totalSeconds % 60).padStart(2, "0")}`;
};

export const App = () => {
  const pathname = window.location.pathname;
  if (pathname === "/documentation") {
    return <Documentation />;
  }
  if (pathname === `/read/${STORY_SLUG}`) {
    return <StoryReader />;
  }
  return <ReaderHome />;
};
