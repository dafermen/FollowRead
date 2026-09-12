const base = import.meta.env.BASE_URL.replace(/\/$/u, "");

export const adminHref = (path: string): string => `${base}${path}`;

export const adminPathname = (): string => {
  const path = window.location.pathname;
  return base !== "" && (path === base || path.startsWith(`${base}/`))
    ? path.slice(base.length) || "/"
    : path;
};
