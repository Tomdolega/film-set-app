export function getWebBaseUrl(): string {
  return process.env.WEB_URL?.trim()
    || process.env.WEB_BASE_URL?.trim()
    || (process.env.NODE_ENV === "production"
      ? (() => {
          throw new Error("WEB_URL is required in production.");
        })()
      : "http://localhost:3000");
}

export function buildWebUrl(path: string): string {
  return `${getWebBaseUrl()}${normalizeRedirectPath(path)}`;
}

export function normalizeRedirectPath(path: string | null | undefined, fallback = "/"): string {
  if (path && path.startsWith("/") && !path.startsWith("//")) {
    return path;
  }

  return fallback;
}
