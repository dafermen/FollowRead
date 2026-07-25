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
import { getCookie } from "../auth/authClient.js";
