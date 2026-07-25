export type EditorialCatalogItem = {
  id: string;
  slug: string;
  title: string;
  content_type: "story" | "article" | "book" | "lesson";
  audience: string;
  languages: string[];
  version: number;
  status: string;
  updated_at: string;
  actions: string[];
};

export type EditorialCatalogPage = {
  items: EditorialCatalogItem[];
  total: number;
  limit: number;
  offset: number;
};

export type EditorialCatalogQuery = {
  search: string;
  status: string;
  contentType: string;
  sort: string;
  limit: number;
  offset: number;
};

export type CreateEditorialContentRequest = {
  slug: string;
  title: string;
  content_type: string;
  audience: string;
  reading_level: string;
  languages: string[];
  categories: string[];
};

export type EditorParagraph = {
  stable_key: string;
  position: number;
  text: string;
};

export type EditorChapter = {
  stable_key: string;
  position: number;
  title: string | null;
  paragraphs: EditorParagraph[];
};

export type EditorTranslation = {
  language: string;
  title: string;
  summary: string | null;
  chapters: EditorChapter[];
};

export type EditorDocument = {
  content_id: string;
  content_version_id: string;
  slug: string;
  version: number;
  status: string;
  updated_at: string;
  translations: EditorTranslation[];
};

export class EditorRequestError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Editor request failed.");
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const getEditorialContent = async (
  query: EditorialCatalogQuery,
): Promise<EditorialCatalogPage> => {
  const parameters = new URLSearchParams({
    sort: query.sort,
    limit: String(query.limit),
    offset: String(query.offset),
  });
  if (query.search !== "") {
    parameters.set("search", query.search);
  }
  if (query.status !== "") {
    parameters.set("status", query.status);
  }
  if (query.contentType !== "") {
    parameters.set("content_type", query.contentType);
  }

  const response = await fetch(`${API_BASE_URL}/admin/content?${parameters.toString()}`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error("Editorial catalog request failed.");
  }
  return (await response.json()) as EditorialCatalogPage;
};

export const createEditorialContent = async (
  body: CreateEditorialContentRequest,
): Promise<EditorialCatalogItem> => {
  const csrfToken = getCookie("followread_csrf");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (csrfToken !== undefined) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  const response = await fetch(`${API_BASE_URL}/admin/content`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Editorial content creation failed with status ${String(response.status)}.`);
  }
  return (await response.json()) as EditorialCatalogItem;
};

export const getEditorDocument = async (contentId: string): Promise<EditorDocument> => {
  const response = await fetch(`${API_BASE_URL}/admin/content/${contentId}/editor`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new EditorRequestError(response.status);
  }
  return (await response.json()) as EditorDocument;
};

export const saveEditorDocument = async (document: EditorDocument): Promise<EditorDocument> => {
  const csrfToken = getCookie("followread_csrf");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (csrfToken !== undefined) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  const response = await fetch(`${API_BASE_URL}/admin/content/${document.content_id}/editor`, {
    method: "PUT",
    credentials: "include",
    headers,
    body: JSON.stringify({
      expected_updated_at: document.updated_at,
      translations: document.translations,
    }),
  });
  if (!response.ok) {
    throw new EditorRequestError(response.status);
  }
  return (await response.json()) as EditorDocument;
};

export const uploadIllustration = async (
  contentId: string,
  file: File,
  altText: string,
): Promise<void> => {
  const payloadBase64 = await readFileAsBase64(file);
  const csrfToken = getCookie("followread_csrf");
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  if (csrfToken !== undefined) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  const response = await fetch(`${API_BASE_URL}/admin/content/${contentId}/illustrations`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({
      content_type: file.type,
      payload_base64: payloadBase64,
      alt_text: altText,
      position: 0,
    }),
  });
  if (!response.ok) {
    throw new Error(`Illustration upload failed with status ${String(response.status)}.`);
  }
};

const readFileAsBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result !== "string") {
        reject(new Error("The illustration encoding is unavailable."));
        return;
      }
      const value = reader.result;
      resolve(value.includes(",") ? (value.split(",")[1] ?? "") : value);
    });
    reader.addEventListener("error", () => {
      reject(new Error("The illustration could not be read."));
    });
    reader.readAsDataURL(file);
  });
import { getCookie } from "../auth/authClient.js";
