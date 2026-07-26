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

export type CatalogCategory = { slug: string; name: string };

export type CatalogItem = {
  id: string;
  slug: string;
  content_type: "story" | "article" | "book" | "lesson";
  audience: "children" | "adults" | "general" | "english_learners";
  reading_level: { code: string; label: string };
  categories: CatalogCategory[];
  languages: ReaderLanguageCode[];
  version: number;
  checksum: string;
  package_url: string;
  minimum_app_version: string;
  published_at: string;
};

export type CatalogPage = {
  items: CatalogItem[];
  total: number;
  limit: number;
  offset: number;
};

export type ReaderLibraryItem = {
  catalog: CatalogItem;
  package: ReaderPackage;
  availability: OfflineAvailability;
};

type ReaderLanguageCode = "es" | "en";

const configuredApiBase: unknown = import.meta.env["VITE_API_BASE_URL"];
const API_BASE_URL =
  typeof configuredApiBase === "string" && configuredApiBase !== ""
    ? configuredApiBase
    : "http://localhost:8000";

export const getReaderPackagePayload = async (slug = "el-zorro-y-la-luna"): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/catalog/${slug}/reader-package`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Reader package failed with status ${String(response.status)}.`);
  }
  return response.text();
};

export const getCatalog = async (): Promise<CatalogPage> => {
  const response = await fetch(`${API_BASE_URL}/catalog?limit=100&offset=0`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Catalog failed with status ${String(response.status)}.`);
  }
  return (await response.json()) as CatalogPage;
};

const remoteReaders = {
  catalog: getCatalog,
  packagePayload: getReaderPackagePayload,
};

export const getReaderPackage = async (slug = "el-zorro-y-la-luna"): Promise<ReaderPackage> =>
  getOfflineAwarePackage(slug, remoteReaders);

/**
 * Joins catalog metadata with the versioned package consumed by the Reader.
 *
 * The catalog intentionally stays lightweight. Fetching packages here keeps all screens on the
 * same public contracts and automatically supports more published stories without hardcoded cards.
 */
export const getReaderLibrary = async (): Promise<ReaderLibraryItem[]> =>
  getOfflineAwareLibrary(remoteReaders);
import { getOfflineAwareLibrary, getOfflineAwarePackage } from "./offlineService.js";
import type { OfflineAvailability } from "./offlineDomain.js";
