import {
  ReaderEngine,
  type ReaderEngineState,
  type ReaderTimeline,
} from "@followread/reader-engine";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { createBrowserNarrator, monotonicBoundaryTime } from "./browserNarrator.js";
import {
  buildLearningInsight,
  sentenceMarksFor,
  summarizeLearningProgress,
  type LearningInsight,
} from "./learningDomain.js";
import { APP_STATE_EVENT, getReaderConnectivity, subscribeConnectivity } from "./mobileRuntime.js";
import {
  getReaderPackage,
  type ReaderMark,
  type ReaderPackage,
  type ReaderTranslation,
} from "./readerClient.js";
import { queueProgressForSync, synchronizePendingProgress } from "./offlineService.js";
import {
  createVocabularyEntry,
  readLearningHistory,
  readPreferences,
  readVocabulary,
  recordLearningHistory,
  saveHistory,
  toggleVocabulary,
  updateVocabulary,
  writePreferences,
  type ReaderLanguage,
  type VocabularyEntry,
} from "./readerStorage.js";
import { createPublishedAudioNarrator } from "./publishedAudioNarrator.js";

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
  const publishedNarrator = useMemo(() => createPublishedAudioNarrator(), []);
  const [story, setStory] = useState<ReaderPackage | null>(null);
  const [online, setOnline] = useState(getReaderConnectivity().connected);
  const [language, setLanguage] = useState<ReaderLanguage>(preferences.defaultLanguage);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [engineState, setEngineState] = useState<ReaderEngineState>(engine.getState());
  const [narrationWarning, setNarrationWarning] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(preferences.showTranslation);
  const [, setLearningRevision] = useState(0);
  const learningTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [selectedWord, setSelectedWord] = useState<{
    mark: ReaderMark;
    insight: LearningInsight;
  } | null>(null);

  const loadTimeline = useCallback(
    (loadedStory: ReaderPackage, selectedLanguage: ReaderLanguage) => {
      const selectedTranslation = loadedStory.translations.find(
        (item) => item.language === selectedLanguage,
      );
      if (selectedTranslation === undefined) {
        return false;
      }
      narrator.stop();
      publishedNarrator.stop();
      const recovered = readProgress(loadedStory.slug, selectedLanguage);
      engine.load(toTimeline(selectedTranslation), recovered);
      engine.setPlaybackRate(preferences.playbackRate);
      return true;
    },
    [engine, narrator, preferences.playbackRate, publishedNarrator],
  );

  useEffect(() => engine.subscribe(setEngineState), [engine]);
  useEffect(() => {
    const handleConnectivity = ({ connected }: { connected: boolean }) => {
      setOnline(connected);
      if (connected) {
        void synchronizePendingProgress();
      }
    };
    return subscribeConnectivity(handleConnectivity);
  }, []);
  useEffect(() => {
    let active = true;
    void getReaderPackage(slug)
      .then((loaded) => {
        if (active) {
          if (!loadTimeline(loaded, preferences.defaultLanguage)) {
            setLoadState("error");
            return;
          }
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
  }, [loadTimeline, preferences.defaultLanguage, slug]);

  const translation = story?.translations.find((item) => item.language === language);
  const publishedAudioActive =
    translation !== undefined && publishedNarrator.canNarrate(translation);
  const switchLanguage = (selectedLanguage: ReaderLanguage) => {
    if (story === null || !loadTimeline(story, selectedLanguage)) {
      return;
    }
    setLanguage(selectedLanguage);
  };

  useEffect(() => {
    if (engineState.status !== "playing") {
      return;
    }
    const timer = window.setInterval(() => {
      if (publishedAudioActive) {
        engine.seek(
          Math.max(engine.getState().currentTimeMs, publishedNarrator.currentTimeMs),
          true,
        );
      } else {
        engine.tick(100);
      }
    }, 100);
    return () => {
      window.clearInterval(timer);
    };
  }, [engine, engineState.status, publishedAudioActive, publishedNarrator]);

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
    const stableAnchor =
      translation.audio.marks[engineState.activeMarkIndex]?.paragraph_key ??
      chapter?.paragraphs[0]?.stable_key;
    if (stableAnchor !== undefined) {
      void queueProgressForSync({
        slug: story.slug,
        version: story.version,
        stableAnchor,
        positionMs: historyPositionMs,
      }).catch(() => {
        // Local reading remains available even if the sync queue cannot be opened.
      });
    }
  }, [
    engineState.activeChapterIndex,
    engineState.activeMarkIndex,
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
      publishedNarrator.pause();
      engine.handleInterruption();
    };
    const handleAppState = (event: Event) => {
      const { isActive } = (event as CustomEvent<{ isActive: boolean }>).detail;
      if (!isActive) {
        handleInterruption();
      } else {
        engine.handleViewportChange();
      }
    };
    window.addEventListener("resize", handleViewport);
    window.addEventListener("orientationchange", handleViewport);
    window.addEventListener("blur", handleInterruption);
    window.addEventListener(APP_STATE_EVENT, handleAppState);
    return () => {
      window.removeEventListener("resize", handleViewport);
      window.removeEventListener("orientationchange", handleViewport);
      window.removeEventListener("blur", handleInterruption);
      window.removeEventListener(APP_STATE_EVENT, handleAppState);
      narrator.stop();
      publishedNarrator.stop();
    };
  }, [engine, narrator, publishedNarrator]);

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
  const narrationEnabled =
    preferences.narrationEnabled && (publishedAudioActive || narrator.available);
  const learningProgress = summarizeLearningProgress(
    readVocabulary(window.localStorage),
    readLearningHistory(window.localStorage),
  );
  const pairedTranslation = story.translations.find((item) => item.language !== language);

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
    if (
      publishedNarrator.start(
        translation,
        engine.getState().currentTimeMs,
        engine.getState().playbackRate,
        {
          onEnd: () => {
            engine.seek(engine.getState().durationMs);
          },
          onError: () => {
            setNarrationWarning(
              "El audio publicado se interrumpió. El texto, los controles y tu progreso siguen disponibles.",
            );
          },
        },
      )
    ) {
      return;
    }
    narrator.start(
      translation,
      translation.audio.marks[startIndex]?.char_start ?? 0,
      engine.getState().playbackRate,
      {
        onBoundary: (mark) => {
          const targetIndex = translation.audio.marks.indexOf(mark);
          const current = engine.getState();
          const nextTime = monotonicBoundaryTime(
            current.currentTimeMs,
            current.activeMarkIndex,
            targetIndex,
            mark.start_ms,
          );
          if (nextTime !== null) {
            engine.seek(nextTime, true);
          }
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
      publishedNarrator.pause();
      engine.pause();
      return;
    }
    engine.play();
    const resumed = publishedAudioActive ? publishedNarrator.resume() : narrator.resume();
    if (!resumed) {
      beginNarration();
    }
  };

  const stopNarrationAndSeek = (timeMs: number) => {
    narrator.stop();
    publishedNarrator.stop();
    engine.seek(timeMs);
  };

  const repeatActiveWord = () => {
    const mark = engine.getActiveMark();
    if (mark === null) {
      return;
    }
    narrator.stop();
    publishedNarrator.stop();
    engine.repeatActiveWord();
    speakLearningText(mark.value);
  };

  const speakLearningText = (text: string) => {
    narrator.stop();
    publishedNarrator.stop();
    engine.pause();
    if (
      !preferences.narrationEnabled ||
      typeof window.speechSynthesis === "undefined" ||
      typeof SpeechSynthesisUtterance === "undefined"
    ) {
      setNarrationWarning(
        preferences.narrationEnabled
          ? "La voz del dispositivo no está disponible. El segmento quedó seleccionado."
          : "Activa la narración del dispositivo para escuchar este segmento.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "en" ? "en-US" : "es-ES";
    utterance.rate = engine.getState().playbackRate;
    utterance.onerror = () => {
      setNarrationWarning("La voz se interrumpió. El segmento y tu progreso siguen disponibles.");
    };
    setNarrationWarning(null);
    window.speechSynthesis.speak(utterance);
  };

  const repeatActiveSentence = (selectedMark?: ReaderMark) => {
    const mark = selectedMark ?? engine.getActiveMark();
    if (mark === null) {
      return;
    }
    const sourceMark =
      "paragraphKey" in mark
        ? translation.audio.marks.find(
            (candidate) =>
              candidate.paragraph_key === mark.paragraphKey && candidate.start_ms === mark.startMs,
          )
        : mark;
    if (sourceMark === undefined) {
      return;
    }
    const sentence = sentenceMarksFor(translation, sourceMark);
    const firstMark = sentence[0];
    if (firstMark === undefined) {
      return;
    }
    engine.seek(firstMark.start_ms, true);
    speakLearningText(sentence.map((item) => item.value).join(" "));
  };

  const selectLearningWord = (mark: ReaderMark, trigger: HTMLButtonElement) => {
    const insight = buildLearningInsight(story, translation, mark);
    learningTriggerRef.current = trigger;
    recordLearningHistory(window.localStorage, {
      id: insight.id,
      slug: insight.slug,
      word: insight.word,
      translation: insight.translation,
      language: insight.language,
    });
    setLearningRevision((value) => value + 1);
    setSelectedWord({ mark, insight });
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
          <span
            className={
              online ? "reading-connection" : "reading-connection reading-connection--offline"
            }
            role="status"
          >
            {online ? "Sincronizado" : "Sin conexión"}
          </span>
          <div className="language-toggle" aria-label="Idioma de lectura">
            <button
              className={language === "es" ? "active" : ""}
              type="button"
              aria-pressed={language === "es"}
              onClick={() => {
                switchLanguage("es");
              }}
            >
              ES
            </button>
            <button
              className={language === "en" ? "active" : ""}
              type="button"
              aria-pressed={language === "en"}
              onClick={() => {
                switchLanguage("en");
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

      {preferences.mode === "learning" ? (
        <section className="learning-toolbar" aria-label="Herramientas de aprendizaje">
          <div className="learning-toolbar__identity">
            <span aria-hidden="true">Aa</span>
            <div>
              <strong>Modo aprender inglés</strong>
              <small>Toca cualquier palabra para explorarla sin perder tu posición.</small>
            </div>
          </div>
          <div className="learning-toolbar__progress" aria-label="Progreso de aprendizaje">
            <span>
              <strong>{learningProgress.explored}</strong> exploradas
            </span>
            <span>
              <strong>{learningProgress.saved}</strong> guardadas
            </span>
            <span>
              <strong>{learningProgress.mastered}</strong> dominadas
            </span>
          </div>
          <div className="learning-toolbar__actions">
            <button
              className={showTranslation ? "learning-toggle active" : "learning-toggle"}
              type="button"
              aria-pressed={showTranslation}
              onClick={() => {
                const next = !showTranslation;
                setShowTranslation(next);
                writePreferences(window.localStorage, {
                  ...preferences,
                  showTranslation: next,
                });
              }}
            >
              {showTranslation ? "Ocultar traducción" : "Mostrar traducción"}
            </button>
            <a href="/vocabulary">Mi vocabulario →</a>
          </div>
        </section>
      ) : null}

      <div className="reading-layout">
        <aside className="story-visual">
          <img
            src={story.cover_uri ?? `/stories/${story.slug}-cover.png`}
            alt={story.cover_alt_text ?? ""}
          />
          <div>
            <span>
              {publishedAudioActive
                ? "Voz generada por IA"
                : narrationEnabled
                  ? "Voz del dispositivo"
                  : "Seguimiento visual"}
            </span>
            <strong>{translation.audio.voice_id}</strong>
          </div>
        </aside>

        <article className="reading-page">
          <p className="eyebrow">Capítulo {engineState.activeChapterIndex + 1}</p>
          <h1>{chapter?.title}</h1>
          <div className="story-copy" lang={language}>
            {chapter?.paragraphs.map((paragraph) => (
              <div className="story-paragraph" key={paragraph.stable_key}>
                <p>
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
                          onClick={(event) => {
                            selectLearningWord(mark, event.currentTarget);
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
                {preferences.mode === "learning" && showTranslation ? (
                  <p className="paragraph-translation" lang={pairedTranslation?.language}>
                    <span>Traducción editorial</span>
                    {pairedTranslation?.chapters
                      .flatMap((item) => item.paragraphs)
                      .find((item) => item.stable_key === paragraph.stable_key)?.text ??
                      "Traducción no disponible para este párrafo."}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </div>

      {selectedWord !== null ? (
        <LearningPanel
          entry={createVocabularyEntry({
            slug: story.slug,
            word: selectedWord.insight.word,
            translation: selectedWord.insight.translation,
            language,
            meaning: selectedWord.insight.meaning,
            sourceExample: selectedWord.insight.sourceExample,
            translatedExample: selectedWord.insight.translatedExample,
          })}
          onRepeatWord={() => {
            engine.seek(selectedWord.mark.start_ms, true);
            speakLearningText(selectedWord.mark.value);
          }}
          onRepeatSentence={() => {
            repeatActiveSentence(selectedWord.mark);
          }}
          onChanged={() => {
            setLearningRevision((value) => value + 1);
          }}
          onClose={() => {
            setSelectedWord(null);
            window.setTimeout(() => {
              learningTriggerRef.current?.focus();
            });
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
              publishedNarrator.stop();
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
              publishedNarrator.stop();
              engine.changeChapter(1);
            }}
          >
            →|
          </button>
          <button type="button" aria-label="Repetir palabra" onClick={repeatActiveWord}>
            ↻ Palabra
          </button>
          {preferences.mode === "learning" ? (
            <button
              type="button"
              aria-label="Repetir oración"
              onClick={() => {
                repeatActiveSentence();
              }}
            >
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
                  publishedNarrator.stop();
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
  onRepeatWord,
  onRepeatSentence,
  onChanged,
  onClose,
}: {
  entry: VocabularyEntry;
  onRepeatWord: () => void;
  onRepeatSentence: () => void;
  onChanged: () => void;
  onClose: () => void;
}) => {
  const existing = readVocabulary(window.localStorage).find((item) => item.id === entry.id);
  const [saved, setSaved] = useState(existing !== undefined);
  const [favorite, setFavorite] = useState(existing?.favorite ?? false);
  const [status, setStatus] = useState(existing?.status ?? "new");
  const closeButton = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    closeButton.current?.focus();
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <aside
      className="learning-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby="learning-word"
    >
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
      <p className="learning-panel__translation">{entry.translation}</p>
      <p className="learning-panel__meaning">{entry.meaning}</p>
      <div className="learning-example">
        <span>Ejemplo en el cuento</span>
        <q lang={entry.language}>{entry.sourceExample}</q>
        <small>{entry.translatedExample}</small>
      </div>
      <div className="learning-panel__audio">
        <button className="secondary-action" type="button" onClick={onRepeatWord}>
          ▶ Repetir palabra
        </button>
        <button className="secondary-action" type="button" onClick={onRepeatSentence}>
          ↻ Repetir oración
        </button>
      </div>
      <div className="learning-panel__study">
        <button
          className="primary-action"
          type="button"
          aria-pressed={saved}
          onClick={() => {
            const next = toggleVocabulary(window.localStorage, entry);
            setSaved(next);
            if (!next) {
              setFavorite(false);
              setStatus("new");
            }
            onChanged();
          }}
        >
          {saved ? "✓ Guardada" : "+ Guardar palabra"}
        </button>
        <button
          className={favorite ? "favorite-word active" : "favorite-word"}
          type="button"
          aria-label={favorite ? "Quitar de palabras favoritas" : "Marcar como palabra favorita"}
          aria-pressed={favorite}
          onClick={() => {
            if (!saved) {
              toggleVocabulary(window.localStorage, entry);
              setSaved(true);
            }
            const next = !favorite;
            updateVocabulary(window.localStorage, entry.id, { favorite: next });
            setFavorite(next);
            onChanged();
          }}
        >
          {favorite ? "★ Favorita" : "☆ Favorita"}
        </button>
      </div>
      {saved ? (
        <label className="learning-status">
          <span>Mi avance con esta palabra</span>
          <select
            value={status}
            onChange={(event) => {
              const next = event.target.value as VocabularyEntry["status"];
              updateVocabulary(window.localStorage, entry.id, { status: next });
              setStatus(next);
              onChanged();
            }}
          >
            <option value="new">Nueva</option>
            <option value="learning">Aprendiendo</option>
            <option value="mastered">Dominada</option>
          </select>
        </label>
      ) : null}
    </aside>
  );
};

const ReadingHand = () => (
  <span className="reading-hand" aria-hidden="true">
    ☝️
  </span>
);

const toTimeline = (translation: ReaderTranslation): ReaderTimeline => {
  let previousEndMs = 0;
  const durationMs = translation.audio.duration_ms;
  return {
    durationMs,
    chapters: translation.chapters.map((chapter) => ({
      stableKey: chapter.stable_key,
      title: chapter.title,
      paragraphKeys: chapter.paragraphs.map((paragraph) => paragraph.stable_key),
    })),
    marks: translation.audio.marks.map((mark) => {
      const startMs = Math.min(durationMs, Math.max(previousEndMs, mark.start_ms));
      const endMs = Math.min(durationMs, Math.max(startMs, mark.end_ms));
      previousEndMs = endMs;
      return {
        value: mark.value,
        startMs,
        endMs,
        charStart: mark.char_start,
        charEnd: mark.char_end,
        paragraphKey: mark.paragraph_key,
        chapterKey: mark.chapter_key,
      };
    }),
  };
};

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
