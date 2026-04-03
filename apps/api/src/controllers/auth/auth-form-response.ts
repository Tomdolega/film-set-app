import type { Request, Response } from "express";

import { buildWebUrl, normalizeRedirectPath } from "../../lib/web-url.js";

interface ErrorWithMessage {
  message?: string;
}

export function isBrowserFormRequest(request: Request): boolean {
  return typeof request.body?.redirectPath === "string";
}

export function getRedirectPath(request: Request, fallback: string): string {
  return normalizeRedirectPath(
    typeof request.body?.redirectPath === "string" ? request.body.redirectPath : null,
    fallback,
  );
}

export function redirectToWeb(response: Response, path: string): void {
  response.redirect(303, buildWebUrl(path));
}

export function redirectToWebWithError(response: Response, path: string, error: unknown): void {
  const url = new URL(buildWebUrl(path));
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? ((error as ErrorWithMessage).message ?? "Authentication failed")
      : "Authentication failed";

  url.searchParams.set("error", message);
  response.redirect(303, url.toString());
}
