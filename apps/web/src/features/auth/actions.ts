"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";
import { clearSessionCookie, getSessionCookieHeader, setSessionCookieFromHeader } from "@/lib/session-cookie";
import { getApiUrl } from "@/lib/runtime-config";

export async function loginAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = readRequiredString(formData, "email");
  const password = readPassword(formData, "password");

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  try {
    await authenticateAndStoreSession("/auth/login", {
      email,
      password,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to log in.",
    };
  }

  redirect("/organizations");
}

export async function registerAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readOptionalString(formData, "name");
  const email = readRequiredString(formData, "email");
  const password = readPassword(formData, "password");

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  try {
    await authenticateAndStoreSession("/auth/register", {
      name,
      email,
      password,
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create the account.",
    };
  }

  redirect("/organizations");
}

export async function logoutAction(): Promise<void> {
  const cookieHeader = await getSessionCookieHeader();

  try {
    await fetch(`${getApiUrl()}/auth/logout`, {
      method: "POST",
      cache: "no-store",
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    });
  } finally {
    await clearSessionCookie();
  }

  redirect("/login");
}

async function authenticateAndStoreSession(
  path: "/auth/login" | "/auth/register",
  payload: Record<string, string | null>,
): Promise<void> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    method: "POST",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = path === "/auth/login" ? "Unable to log in." : "Unable to create the account.";

    try {
      const parsed = (await response.json()) as { error?: { message?: string } };
      if (parsed.error?.message) {
        message = parsed.error.message;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  await setSessionCookieFromHeader(response.headers.get("set-cookie"));
}

function readRequiredString(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, fieldName: string): string | null {
  const value = readRequiredString(formData, fieldName);
  return value || null;
}

function readPassword(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value : "";
}
