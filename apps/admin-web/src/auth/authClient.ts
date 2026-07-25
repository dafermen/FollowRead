export type AuthenticatedUser = {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  permissions: string[];
};

export type SessionResponse = {
  user: AuthenticatedUser;
  idle_expires_at?: string | null;
  absolute_expires_at?: string | null;
};

export class AuthenticationError extends Error {
  readonly status: number;

  constructor(status: number) {
    super("Authentication request failed.");
    this.name = "AuthenticationError";
    this.status = status;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

const isAuthenticatedUser = (value: unknown): value is AuthenticatedUser => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate["id"] === "string" &&
    typeof candidate["email"] === "string" &&
    typeof candidate["display_name"] === "string" &&
    Array.isArray(candidate["roles"]) &&
    candidate["roles"].every((role) => typeof role === "string") &&
    Array.isArray(candidate["permissions"]) &&
    candidate["permissions"].every((permission) => typeof permission === "string")
  );
};

const readSessionResponse = async (response: Response): Promise<SessionResponse> => {
  if (!response.ok) {
    throw new AuthenticationError(response.status);
  }

  const body: unknown = await response.json();
  const bodyRecord = body as Record<string, unknown> | null;
  if (bodyRecord === null || !isAuthenticatedUser(bodyRecord["user"])) {
    throw new AuthenticationError(502);
  }

  return body as SessionResponse;
};

export const login = async (email: string, password: string): Promise<SessionResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return readSessionResponse(response);
};

export const getCurrentSession = async (): Promise<SessionResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/session`, {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  return readSessionResponse(response);
};

export const getCookie = (name: string) => {
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix));
  return cookie === undefined ? undefined : decodeURIComponent(cookie.slice(prefix.length));
};

export const logout = async (): Promise<void> => {
  const csrfToken = getCookie("followread_csrf");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (csrfToken !== undefined) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
    headers,
  });
  if (!response.ok) {
    throw new AuthenticationError(response.status);
  }
};
