import {
  ReaderEngine,
  type ReaderEngineState,
  type ReaderTimeline,
} from "@followread/reader-engine";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { createBrowserNarrator } from "./browserNarrator.js";
import {
  getReaderPackage,
  type ReaderMark,
  type ReaderPackage,
  type ReaderTranslation,
} from "./readerClient.js";
import {
  createVocabularyEntry,
  readPreferences,
  readVocabulary,
  saveHistory,
  toggleVocabulary,
  type ReaderLanguage,
  type VocabularyEntry,
} from "./readerStorage.js";

/**
 * Distraction-free reading room backed by the reusable Reader Engine.
 *
 * Browser narration is an optional adapter. The engine remains the source of playback state and
 * visual timing; word-boundary events from the device voice only correct its position.
 */
export const StoryReaderPage = ({ slug }: { slug: string }) => {
  const preferences = useMemo(() => readPreferences(window.localStorage), []);
  const engine = useMemo(() => new ReaderEngine(), []);
  const narrator = useMemo(() => createBrowserNarrator(), []);
  const [story, setStory] = useState<ReaderPackage | null>(null);
  const [language, setLanguage] = useState<ReaderLanguage>(preferences.defaultLanguage);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [engineState, setEngineState] = useState<ReaderEngineState>(engine.getState());
  const [narrationWarning, setNarrationWarning] = useState<string | null>(null);
  const [selectedWord, setSelectedWord] = useState<{
    mark: ReaderMark;
    index: number;
    translation: string;
  } | null>(null);

  useEffect(() => engine.subscribe(setEngineState), [engine]);
  useEffect(() => {
    let active = true;
    void getReaderPackage(slug)
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
  }, [slug]);

  const translation = story?.translations.find((item) => item.language === language);
  useEffect(() => {
    if (translation === undefined || story === null) {
      return;
    }
    narrator.stop();
    const recovered = readProgress(story.slug, language);
    engine.load(toTimeline(translation), recovered);
    engine.setPlaybackRate(preferences.playbackRate);
  }, [engine, language, narrator, preferences.playbackRate, story, translation]);

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

  const historySecond = Math.floor(engineState.currentTimeMs / 1000);
  const historyPositionMs = historySecond * 1000;
  useEffect(() => {
    if (story === null || translation === undefined || engineState.durationMs <= 0) {
      return;
    }
    const chapter = translation.chapters[engineState.activeChapterIndex];
    saveHistory(window.localStorage, {
      slug: story.slug,
      title: translation.title,
      coverUri: story.cover_uri,
      language,
      positionMs: historyPositionMs,
      durationMs: engineState.durationMs,
      chapterTitle: chapter?.title ?? null,
      updatedAt: new Date().toISOString(),
    });
  }, [
    engineState.activeChapterIndex,
    engineState.durationMs,
    historyPositionMs,
    language,
    story,
    translation,
  ]);

  useEffect(() => {
    const handleViewport = () => {
      engine.handleViewportChange();
    };
    const handleInterruption = () => {
      narrator.pause();
      engine.handleInterruption();
    };
    window.addEventListener("resize", handleViewport);
    window.addEventListener("orientationchange", handleViewport);
    window.addEventListener("blur", handleInterruption);
    return () => {
      window.removeEventListener("resize", handleViewport);
      window.removeEventListener("orientationchange", handleViewport);
      window.removeEventListener("blur", handleInterruption);
      narrator.stop();
    };
  }, [engine, narrator]);

  const activeMarkRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!preferences.autoScroll) {
      return;
    }
    activeMarkRef.current?.scrollIntoView({
      behavior: preferences.reduceMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [
    engineState.activeMarkIndex,
    engineState.layoutRevision,
    preferences.autoScroll,
    preferences.reduceMotion,
  ]);

  if (loadState !== "ready" || story === null || translation === undefined) {
    return (
      <main className="reader-loading" aria-live="polite">
        <span aria-hidden="true">{loadState === "error" ? "!" : "F"}</span>
        <h1>{loadState === "error" ? "No pudimos abrir el cuento" : "Preparando la lectura…"}</h1>
        <p>
          {loadState === "error"
            ? "Tu biblioteca y progreso local se conservan."
            : "Estamos organizando texto, voz y progreso."}
        </p>
        {loadState === "error" ? <a href="/library">Volver a la biblioteca</a> : null}
      </main>
    );
  }

  const chapter = translation.chapters[engineState.activeChapterIndex] ?? translation.chapters[0];
  const percentage =
    engineState.durationMs === 0
      ? 0
      : Math.round((engineState.currentTimeMs / engineState.durationMs) * 100);
  const narrationEnabled = preferences.narrationEnabled && narrator.available;

  const beginNarration = (startIndex = engine.getState().activeMarkIndex) => {
    if (!narrationEnabled) {
      if (preferences.narrationEnabled && !narrator.available) {
        setNarrationWarning(
          "La voz del dispositivo no está disponible. El seguimiento visual continúa.",
        );
      }
      return;
    }
    setNarrationWarning(null);
    narrator.start(
      translation,
      translation.audio.marks[startIndex]?.char_start ?? 0,
      engine.getState().playbackRate,
      {
        onBoundary: (mark) => {
          engine.seek(mark.start_ms, true);
        },
        onEnd: () => {
          engine.seek(engine.getState().durationMs);
        },
        onError: () => {
          setNarrationWarning(
            "La narración se interrumpió. El texto, los controles y tu progreso siguen disponibles.",
          );
        },
      },
    );
  };

  const togglePlayback = () => {
    if (engineState.status === "playing") {
      narrator.pause();
      engine.pause();
      return;
    }
    engine.play();
    if (!narrator.resume()) {
      beginNarration();
    }
  };

  const stopNarrationAndSeek = (timeMs: number) => {
    narrator.stop();
    engine.seek(timeMs);
  };

  const repeatActiveWord = () => {
    const mark = engine.getActiveMark();
    if (mark === null) {
      return;
    }
    narrator.stop();
    engine.repeatActiveWord();
    beginNarration(engine.getState().activeMarkIndex);
  };

  const repeatParagraph = () => {
    const mark = engine.getActiveMark();
    if (mark === null) {
      return;
    }
    const paragraphStart = translation.audio.marks.find(
      (item) => item.paragraph_key === mark.paragraphKey,
    );
    if (paragraphStart === undefined) {
      return;
    }
    narrator.stop();
    engine.seek(paragraphStart.start_ms, true);
    beginNarration(translation.audio.marks.indexOf(paragraphStart));
  };

  const selectLearningWord = (mark: ReaderMark, index: number) => {
    const otherLanguage = language === "en" ? "es" : "en";
    const otherTranslation = story.translations.find((item) => item.language === otherLanguage);
    const paragraphMarks = translation.audio.marks.filter(
      (candidate) => candidate.paragraph_key === mark.paragraph_key,
    );
    const paragraphPosition = paragraphMarks.findIndex(
      (candidate) => candidate.char_start === mark.char_start,
    );
    const translated =
      otherTranslation?.audio.marks.filter(
        (candidate) => candidate.paragraph_key === mark.paragraph_key,
      )[paragraphPosition]?.value ?? "Traducción no disponible";
    setSelectedWord({ mark, index, translation: translated });
  };

  return (
    <main
      className="reading-room"
      data-mode={preferences.mode}
      style={{ "--reading-scale": preferences.fontScale } as CSSProperties}
    >
      <header className="reading-header">
        <a href={`/details/${story.slug}`} aria-label="Volver a los detalles">
          ←
        </a>
        <div>
          <strong>{translation.title}</strong>
          <span>
            Capítulo {engineState.activeChapterIndex + 1} de {translation.chapters.length}
          </span>
        </div>
        <div className="reading-header__actions">
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
          <a className="reader-settings-link" href="/settings" aria-label="Ajustes de lectura">
            ⚙
          </a>
        </div>
      </header>

      {narrationWarning !== null ? (
        <div className="narration-warning" role="status">
          <span aria-hidden="true">ⓘ</span>
          {narrationWarning}
        </div>
      ) : null}

      <div className="reading-layout">
        <aside className="story-visual">
          <img
            src={story.cover_uri ?? `/stories/${story.slug}-cover.png`}
            alt={story.cover_alt_text ?? ""}
          />
          <div>
            <span>{narrationEnabled ? "Voz del dispositivo" : "Seguimiento visual"}</span>
            <strong>{translation.audio.voice_id}</strong>
          </div>
        </aside>

        <article className="reading-page">
          <p className="eyebrow">Capítulo {engineState.activeChapterIndex + 1}</p>
          <h1>{chapter?.title}</h1>
          <div className="story-copy" lang={language}>
            {chapter?.paragraphs.map((paragraph) => (
              <p key={paragraph.stable_key}>
                {translation.audio.marks
                  .map((mark, index) => ({ mark, index }))
                  .filter(({ mark }) => mark.paragraph_key === paragraph.stable_key)
                  .map(({ mark, index }) => {
                    const active = index === engineState.activeMarkIndex;
                    const className = active ? "story-word story-word--active" : "story-word";
                    const content = (
                      <>
                        {active && preferences.showPointer ? <ReadingHand /> : null}
                        {mark.value}{" "}
                      </>
                    );
                    return preferences.mode === "learning" ? (
                      <button
                        className={className}
                        ref={
                          active
                            ? (element) => {
                                activeMarkRef.current = element;
                              }
                            : undefined
                        }
                        type="button"
                        onClick={() => {
                          selectLearningWord(mark, index);
                        }}
                        key={`${paragraph.stable_key}-${String(index)}`}
                      >
                        {content}
                      </button>
                    ) : (
                      <span
                        className={className}
                        ref={
                          active
                            ? (element) => {
                                activeMarkRef.current = element;
                              }
                            : undefined
                        }
                        key={`${paragraph.stable_key}-${String(index)}`}
                      >
                        {content}
                      </span>
                    );
                  })}
              </p>
            ))}
          </div>
        </article>
      </div>

      {selectedWord !== null ? (
        <LearningPanel
          entry={createVocabularyEntry({
            slug: story.slug,
            word: selectedWord.mark.value,
            translation: selectedWord.translation,
            language,
          })}
          onRepeat={() => {
            narrator.stop();
            engine.seek(selectedWord.mark.start_ms, true);
            beginNarration(selectedWord.index);
          }}
          onClose={() => {
            setSelectedWord(null);
          }}
        />
      ) : null}

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
              aria-valuetext={`${String(percentage)} por ciento`}
              onChange={(event) => {
                stopNarrationAndSeek(Number(event.target.value));
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
              narrator.stop();
              engine.changeChapter(-1);
            }}
          >
            |←
          </button>
          <button
            className="advanced-control"
            type="button"
            aria-label="Retroceder cinco segundos"
            onClick={() => {
              stopNarrationAndSeek(engineState.currentTimeMs - 5000);
            }}
          >
            −5
          </button>
          <button
            className="play-control"
            type="button"
            aria-label={engineState.status === "playing" ? "Pausar" : "Reproducir"}
            onClick={togglePlayback}
          >
            {engineState.status === "playing" ? "Ⅱ" : "▶"}
          </button>
          <button
            className="advanced-control"
            type="button"
            aria-label="Avanzar cinco segundos"
            onClick={() => {
              stopNarrationAndSeek(engineState.currentTimeMs + 5000);
            }}
          >
            +5
          </button>
          <button
            className="advanced-control"
            type="button"
            aria-label="Capítulo siguiente"
            onClick={() => {
              narrator.stop();
              engine.changeChapter(1);
            }}
          >
            →|
          </button>
          <button type="button" aria-label="Repetir palabra" onClick={repeatActiveWord}>
            ↻ Palabra
          </button>
          {preferences.mode === "learning" ? (
            <button type="button" aria-label="Repetir párrafo" onClick={repeatParagraph}>
              ↻ Oración
            </button>
          ) : null}
          <label className="speed-control">
            <span>Velocidad</span>
            <select
              value={engineState.playbackRate}
              onChange={(event) => {
                const rate = Number(event.target.value);
                const wasPlaying = engineState.status === "playing";
                engine.setPlaybackRate(rate);
                if (wasPlaying) {
                  narrator.stop();
                  beginNarration();
                }
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
        <p className="playback-note">
          {engineState.status === "playing"
            ? `Leyendo visualmente · ${narrationEnabled ? "voz activa" : "sin voz"}`
            : "Lectura pausada · tu progreso se guarda automáticamente"}
        </p>
      </section>
    </main>
  );
};

const LearningPanel = ({
  entry,
  onRepeat,
  onClose,
}: {
  entry: VocabularyEntry;
  onRepeat: () => void;
  onClose: () => void;
}) => {
  const [saved, setSaved] = useState(() =>
    readVocabulary(window.localStorage).some((item) => item.id === entry.id),
  );
  const closeButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButton.current?.focus();
  }, []);

  return (
    <aside className="learning-panel" aria-labelledby="learning-word">
      <button
        ref={closeButton}
        className="learning-panel__close"
        type="button"
        aria-label="Cerrar ayuda de palabra"
        onClick={onClose}
      >
        ×
      </button>
      <p className="eyebrow">Vocabulario contextual</p>
      <h2 id="learning-word" lang={entry.language}>
        {entry.word}
      </h2>
      <p>{entry.translation}</p>
      <div>
        <button className="secondary-action" type="button" onClick={onRepeat}>
          ▶ Escuchar palabra
        </button>
        <button
          className="primary-action"
          type="button"
          aria-pressed={saved}
          onClick={() => {
            setSaved(toggleVocabulary(window.localStorage, entry));
          }}
        >
          {saved ? "✓ Guardada" : "+ Guardar palabra"}
        </button>
      </div>
    </aside>
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
