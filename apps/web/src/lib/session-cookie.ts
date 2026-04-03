import "server-only";

import { cookies } from "next/headers";

export function getSessionCookieName(): string {
  return process.env.SESSION_COOKIE_NAME?.trim() || "session_id";
}

export async function getSessionCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore.toString();
}

export async function setSessionCookieFromHeader(setCookieHeader: string | null): Promise<void> {
  const parsedCookie = parseSessionCookie(setCookieHeader);

  if (!parsedCookie) {
    throw new Error("Authentication response did not include a session cookie.");
  }

  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(), parsedCookie.value, {
    httpOnly: true,
    sameSite: getSessionCookieSameSite(),
    secure: getSessionCookieSecure(),
    path: "/",
    ...(getSessionCookieDomain() ? { domain: getSessionCookieDomain() } : {}),
    ...(parsedCookie.expiresAt ? { expires: parsedCookie.expiresAt } : {}),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(getSessionCookieName(), "", {
    httpOnly: true,
    sameSite: getSessionCookieSameSite(),
    secure: getSessionCookieSecure(),
    path: "/",
    ...(getSessionCookieDomain() ? { domain: getSessionCookieDomain() } : {}),
    expires: new Date(0),
    maxAge: 0,
  });
}

function parseSessionCookie(
  setCookieHeader: string | null,
): { value: string; expiresAt?: Date } | null {
  if (!setCookieHeader) {
    return null;
  }

  const cookieName = `${getSessionCookieName()}=`;
  const cookieSegment = setCookieHeader
    .split(";")
    .map((segment) => segment.trim())
    .find((segment) => segment.startsWith(cookieName));

  if (!cookieSegment) {
    return null;
  }

  const value = cookieSegment.slice(cookieName.length);
  const expiresMatch = setCookieHeader.match(/;\s*Expires=([^;]+)/i);
  const expiresAt = expiresMatch ? new Date(expiresMatch[1]) : undefined;

  return {
    value,
    expiresAt: expiresAt && !Number.isNaN(expiresAt.getTime()) ? expiresAt : undefined,
  };
}

function getSessionCookieDomain(): string | undefined {
  const value = process.env.SESSION_COOKIE_DOMAIN?.trim();
  return value || undefined;
}

function getSessionCookieSecure(): boolean {
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
