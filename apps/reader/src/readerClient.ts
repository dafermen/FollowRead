export type ReaderMark = {
  value: string;
  start_ms: number;
  end_ms: number;
  char_start: number;
  char_end: number;
  paragraph_key: string;
  chapter_key: string;
};

export type ReaderAudio = {
  uri: string;
  duration_ms: number;
  voice_id: string;
  simulated: boolean;
  marks: ReaderMark[];
};

export type ReaderParagraph = { stable_key: string; text: string };

export type ReaderChapter = {
  stable_key: string;
  title: string | null;
  paragraphs: ReaderParagraph[];
};

export type ReaderTranslation = {
  language: "es" | "en";
  title: string;
  summary: string | null;
  chapters: ReaderChapter[];
  audio: ReaderAudio;
};

export type ReaderPackage = {
  content_id: string;
  slug: string;
  version: number;
  cover_uri: string | null;
  cover_alt_text: string | null;
  translations: ReaderTranslation[];
};

const configuredApiBase: unknown = import.meta.env["VITE_API_BASE_URL"];
const API_BASE_URL =
  typeof configuredApiBase === "string" && configuredApiBase !== ""
    ? configuredApiBase
    : "http://localhost:8000";

export const getReaderPackage = async (slug = "el-zorro-y-la-luna"): Promise<ReaderPackage> => {
  const response = await fetch(`${API_BASE_URL}/catalog/${slug}/reader-package`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Reader package failed with status ${String(response.status)}.`);
  }
  return (await response.json()) as ReaderPackage;
};
