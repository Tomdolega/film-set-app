import "server-only";

import { getSessionCookieHeader } from "./session-cookie";
import { getApiUrl } from "./runtime-config";

interface ApiErrorPayload {
  error?: {
    message?: string;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
  }
}

export async function apiRequest<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse> {
  const headers = new Headers(init?.headers ?? {});
  const isFormDataBody = init?.body instanceof FormData;
  const cookieHeader = await getSessionCookieHeader();

  if (!isFormDataBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  if (cookieHeader && !headers.has("cookie")) {
    headers.set("cookie", cookieHeader);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    cache: "no-store",
    headers,
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const payload = (await response.json()) as ApiErrorPayload;
      if (payload.error?.message) {
        message = payload.error.message;
      }
    } catch {
      // Keep the generic message if the response body is not JSON.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

export function getApiBaseUrl(): string {
  return getApiUrl();
}
