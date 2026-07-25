import { getCookie } from "../auth/authClient.js";

export type ReviewAction = "submit" | "approve" | "reject" | "publish" | "unpublish" | "archive";

export type ReviewSnapshot = {
  content_id: string;
  content_version_id: string;
  title: string;
  version: number;
  status: string;
  checks: { code: string; label: string; passed: boolean }[];
  history: { action: string; created_at: string; note: string | null }[];
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const getReviewSnapshot = async (contentId: string): Promise<ReviewSnapshot> => {
  const response = await fetch(`${API_BASE_URL}/admin/content/${contentId}/review`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error(`Review request failed with status ${String(response.status)}.`);
  }
  return (await response.json()) as ReviewSnapshot;
};

export const transitionReview = async (
  contentId: string,
  action: ReviewAction,
  note?: string,
): Promise<ReviewSnapshot> => {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
  };
  const csrf = getCookie("followread_csrf");
  if (csrf !== undefined) {
    headers["X-CSRF-Token"] = csrf;
  }
  const response = await fetch(`${API_BASE_URL}/admin/content/${contentId}/review/${action}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ note }),
  });
  if (!response.ok) {
    throw new Error(`Review transition failed with status ${String(response.status)}.`);
  }
  return (await response.json()) as ReviewSnapshot;
};
