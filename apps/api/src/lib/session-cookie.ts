import type { Request, Response } from "express";

import type { AuthSession } from "@film-set-app/domain-auth";

export function getSessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME?.trim() || "session_id";
}

export function readSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...valueParts] = cookie.trim().split("=");

    if (rawName === getSessionCookieName()) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

export function setSessionCookie(response: Response, session: AuthSession): void {
  response.cookie(getSessionCookieName(), session.id, {
    ...getSessionCookieOptions(),
    expires: session.expiresAt,
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(getSessionCookieName(), getSessionCookieOptions());
}

function getSessionCookieOptions() {
  const domain = process.env.SESSION_COOKIE_DOMAIN?.trim();

  return {
    httpOnly: true,
    sameSite: getSessionCookieSameSite(),
    secure: parseCookieSecureFlag(),
    path: "/",
    ...(domain ? { domain } : {}),
  };
}

function parseCookieSecureFlag(): boolean {
  const value = process.env.SESSION_COOKIE_SECURE?.trim();

  if (!value) {
    return process.env.NODE_ENV === "production";
  }

  return value === "true";
}

function getSessionCookieSameSite(): "lax" | "strict" | "none" {
  const value = process.env.SESSION_COOKIE_SAME_SITE?.trim();

  if (value === "strict" || value === "none") {
    return value;
  }

  return "lax";
}
