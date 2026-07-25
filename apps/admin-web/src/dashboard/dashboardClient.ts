export type DashboardSummary = {
  metrics: { total: number; drafts: number; in_review: number; published: number };
  attention: { reviews: number; failed_jobs: number };
  recent_content: Array<{
    id: string;
    title: string;
    content_type: string;
    audience: string;
    languages: string[];
    version: number;
    status: string;
    updated_at: string;
  }>;
  activity: Array<{
    action: string;
    target_type: string;
    outcome: string;
    occurred_at: string;
  }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    throw new Error("Dashboard request failed.");
  }
  return (await response.json()) as DashboardSummary;
};
