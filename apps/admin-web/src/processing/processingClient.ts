import { getCookie } from "../auth/authClient.js";

export type ProcessingJob = {
  id: string;
  content_version_id: string;
  language: string | null;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  stage: string | null;
  progress_percent: number;
  estimated_cost: string;
  error_code: string | null;
  error_detail: string | null;
  created_at: string;
  updated_at: string;
};

export type Voice = { id: string; language: string; label: string };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const headers = new Headers(options?.headers);
  headers.set("Accept", "application/json");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });
  if (!response.ok) {
    throw new Error(`Processing request failed with status ${String(response.status)}.`);
  }
  return (await response.json()) as T;
};

const mutationHeaders = () => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const csrf = getCookie("followread_csrf");
  if (csrf !== undefined) {
    headers["X-CSRF-Token"] = csrf;
  }
  return headers;
};

export const getProcessingJobs = async () =>
  (await request<{ items: ProcessingJob[] }>("/admin/processing")).items;

export const getVoices = async () => (await request<{ items: Voice[] }>("/admin/voices")).items;

export const startProcessing = async (
  contentVersionId: string,
  language: string,
  voiceId: string,
) =>
  request<ProcessingJob>("/admin/processing", {
    method: "POST",
    headers: mutationHeaders(),
    body: JSON.stringify({
      content_version_id: contentVersionId,
      language,
      voice_id: voiceId,
      idempotency_key: crypto.randomUUID(),
    }),
  });

export const retryProcessing = async (jobId: string) =>
  request<ProcessingJob>(`/admin/processing/${jobId}/retry`, {
    method: "POST",
    headers: mutationHeaders(),
  });

export const cancelProcessing = async (jobId: string) =>
  request<ProcessingJob>(`/admin/processing/${jobId}/cancel`, {
    method: "POST",
    headers: mutationHeaders(),
  });
