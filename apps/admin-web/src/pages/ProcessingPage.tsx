import { useEffect, useState } from "react";

import type { AuthenticatedUser } from "../auth/authClient.js";
import { AdminShell } from "../components/AdminShell.js";
import {
  cancelProcessing,
  getProcessingJobs,
  getVoices,
  retryProcessing,
  startProcessing,
  type ProcessingJob,
  type Voice,
} from "../processing/processingClient.js";

const previewJobs: ProcessingJob[] = [
  {
    id: "preview-1",
    content_version_id: "version-1",
    language: "es",
    status: "succeeded",
    stage: "completed",
    progress_percent: 100,
    estimated_cost: "0.0184",
    error_code: null,
    error_detail: null,
    created_at: new Date(Date.now() - 20 * 60_000).toISOString(),
    updated_at: new Date(Date.now() - 18 * 60_000).toISOString(),
  },
  {
    id: "preview-2",
    content_version_id: "version-2",
    language: "en",
    status: "running",
    stage: "synthesizing",
    progress_percent: 68,
    estimated_cost: "0.0128",
    error_code: null,
    error_detail: null,
    created_at: new Date(Date.now() - 6 * 60_000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "preview-3",
    content_version_id: "version-3",
    language: "es",
    status: "failed",
    stage: "failed",
    progress_percent: 32,
    estimated_cost: "0.0092",
    error_code: "polly.processing_failed",
    error_detail: "La generación se interrumpió y puede reintentarse.",
    created_at: new Date(Date.now() - 60 * 60_000).toISOString(),
    updated_at: new Date(Date.now() - 55 * 60_000).toISOString(),
  },
];

const previewVoices: Voice[] = [
  { id: "marin", language: "es", label: "Marin · OpenAI" },
  { id: "coral", language: "es", label: "Coral · OpenAI" },
  { id: "cedar", language: "en", label: "Cedar · OpenAI" },
  { id: "verse", language: "en", label: "Verse · OpenAI" },
];

type ProcessingPageProps = {
  user?: AuthenticatedUser | undefined;
  onLogout?: (() => Promise<void>) | undefined;
};

export const ProcessingPage = ({ user, onLogout }: ProcessingPageProps) => {
  const isPreview = user === undefined;
  const contentVersionId = new URLSearchParams(window.location.search).get("version") ?? "";
  const [jobs, setJobs] = useState<ProcessingJob[]>(isPreview ? previewJobs : []);
  const [voices, setVoices] = useState<Voice[]>(isPreview ? previewVoices : []);
  const [language, setLanguage] = useState("es");
  const [voice, setVoice] = useState("marin");
  const [state, setState] = useState<"ready" | "loading" | "error">(
    isPreview ? "ready" : "loading",
  );

  useEffect(() => {
    if (isPreview) {
      return;
    }
    let active = true;
    void Promise.all([getProcessingJobs(), getVoices()])
      .then(([loadedJobs, loadedVoices]) => {
        if (active) {
          setJobs(loadedJobs);
          setVoices(loadedVoices);
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

  const selectedVoices = voices.filter((item) => item.language === language);
  const runAction = (action: () => Promise<ProcessingJob>) => {
    setState("loading");
    void action()
      .then((job) => {
        setJobs((current) => [job, ...current.filter((item) => item.id !== job.id)]);
        setState("ready");
      })
      .catch(() => {
        setState("error");
      });
  };

  return (
    <AdminShell activeItem="processing" user={user} onLogout={onLogout}>
      <main className="dashboard processing-page">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Audio y sincronización</p>
            <h1>Procesamiento</h1>
            <p className="page-subtitle">
              Genera narración una sola vez y reutiliza el MP3 guardado en futuras reproducciones.
            </p>
          </div>
          <span className="provider-badge">
            <span aria-hidden="true">●</span> Credenciales protegidas en la API
          </span>
        </div>

        {contentVersionId !== "" || isPreview ? (
          <section className="panel processing-launcher" aria-labelledby="launcher-title">
            <div>
              <p className="eyebrow">Nueva generación</p>
              <h2 id="launcher-title">Preparar audio sincronizado</h2>
              <p>
                El texto se divide automáticamente. Si no cambió el texto, la voz ni el modelo, se
                usa el audio guardado sin volver a llamar a la API de pago.
              </p>
            </div>
            <div className="voice-controls">
              <label>
                <span>Idioma</span>
                <select
                  value={language}
                  onChange={(event) => {
                    const nextLanguage = event.target.value;
                    setLanguage(nextLanguage);
                    setVoice(nextLanguage === "es" ? "marin" : "cedar");
                  }}
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </label>
              <label>
                <span>Voz</span>
                <select
                  value={voice}
                  onChange={(event) => {
                    setVoice(event.target.value);
                  }}
                >
                  {selectedVoices.map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="cost-preview">
                <span>Costo máximo</span>
                <strong>US$ 1.00</strong>
              </div>
              <button
                className="button button--primary"
                type="button"
                disabled={state === "loading"}
                onClick={() => {
                  if (isPreview) {
                    setJobs((current) => [
                      {
                        id: `preview-${String(Date.now())}`,
                        content_version_id: "version-preview",
                        language,
                        status: "succeeded",
                        stage: "completed",
                        progress_percent: 100,
                        estimated_cost: "0.0128",
                        error_code: null,
                        error_detail: null,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                      },
                      ...current,
                    ]);
                  } else {
                    runAction(() => startProcessing(contentVersionId, language, voice));
                  }
                }}
              >
                Generar audio
              </button>
            </div>
          </section>
        ) : (
          <div className="inline-alert">
            Abre un borrador desde Contenidos para iniciar una nueva generación.
          </div>
        )}

        {state === "error" ? (
          <div className="inline-alert" role="alert">
            No pudimos actualizar el procesamiento. Los trabajos existentes no cambiaron.
          </div>
        ) : null}

        <section className="processing-grid" aria-label="Trabajos de procesamiento">
          <div className="panel job-list">
            <div className="panel__heading">
              <div>
                <p className="eyebrow">Actividad</p>
                <h2>Trabajos recientes</h2>
              </div>
              <span>{jobs.length}</span>
            </div>
            {jobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className={`job-icon job-icon--${job.status}`} aria-hidden="true">
                  {job.status === "succeeded" ? "✓" : job.status === "failed" ? "!" : "◌"}
                </div>
                <div className="job-card__body">
                  <div>
                    <strong>
                      Audio {job.language?.toUpperCase() ?? "—"} ·{" "}
                      {job.content_version_id.slice(0, 8)}
                    </strong>
                    <span className={`status-badge status-badge--${jobStatusClass(job.status)}`}>
                      {jobStatusLabel(job.status)}
                    </span>
                  </div>
                  <div
                    className="job-progress"
                    role="progressbar"
                    aria-label={`Progreso ${job.language ?? ""}`}
                    aria-valuenow={job.progress_percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <span style={{ width: `${String(job.progress_percent)}%` }} />
                  </div>
                  <div className="job-meta">
                    <span>{jobStageLabel(job.stage)}</span>
                    <span>{String(job.progress_percent)}%</span>
                    <span>US$ {job.estimated_cost}</span>
                  </div>
                  {job.error_detail !== null ? (
                    <p className="job-error">{job.error_detail}</p>
                  ) : null}
                </div>
                <div className="job-actions">
                  {job.status === "failed" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (isPreview) {
                          setJobs((current) =>
                            current.map((item) =>
                              item.id === job.id
                                ? {
                                    ...item,
                                    status: "succeeded",
                                    stage: "completed",
                                    progress_percent: 100,
                                    error_detail: null,
                                  }
                                : item,
                            ),
                          );
                        } else {
                          runAction(() => retryProcessing(job.id));
                        }
                      }}
                    >
                      Reintentar
                    </button>
                  ) : null}
                  {job.status === "queued" || job.status === "running" ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (isPreview) {
                          setJobs((current) =>
                            current.map((item) =>
                              item.id === job.id ? { ...item, status: "cancelled" } : item,
                            ),
                          );
                        } else {
                          runAction(() => cancelProcessing(job.id));
                        }
                      }}
                    >
                      Cancelar
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>

          <aside className="panel processing-diagnostics">
            <p className="eyebrow">Diagnóstico</p>
            <h2>Qué genera FollowRead</h2>
            <ol>
              {[
                ["Fragmentos seguros", "Divide textos largos sin cortar palabras."],
                ["Voz natural", "Puede usar OpenAI sin exponer la clave al navegador."],
                ["Speech Marks", "Asocia tiempo, carácter y párrafo a cada palabra."],
                ["Caché persistente", "Reutiliza el MP3 si el contenido y la voz no cambiaron."],
              ].map(([title, description], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      </main>
    </AdminShell>
  );
};

const jobStatusLabel = (status: ProcessingJob["status"]) =>
  ({
    queued: "En cola",
    running: "Procesando",
    succeeded: "Completado",
    failed: "Con error",
    cancelled: "Cancelado",
  })[status];

const jobStatusClass = (status: ProcessingJob["status"]) =>
  ({
    queued: "draft",
    running: "processing",
    succeeded: "published",
    failed: "failed",
    cancelled: "draft",
  })[status];

const jobStageLabel = (stage: string | null) =>
  stage === "cached" ? "Audio reutilizado · sin costo API" : (stage ?? "Preparando");
