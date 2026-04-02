const DEFAULT_API_BASE_URL = "http://127.0.0.1:3001";
const DEFAULT_MOCK_USER_ID = "11111111-1111-1111-1111-111111111111";
const DEFAULT_MOCK_USER_EMAIL = "owner@example.com";
const DEFAULT_MOCK_USER_NAME = "Mock Owner";

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

  if (!isFormDataBody && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  if (!headers.has("x-user-id")) {
    headers.set("x-user-id", process.env.MOCK_USER_ID ?? DEFAULT_MOCK_USER_ID);
  }

  if (!headers.has("x-user-email")) {
    headers.set("x-user-email", process.env.MOCK_USER_EMAIL ?? DEFAULT_MOCK_USER_EMAIL);
  }

  if (!headers.has("x-user-name")) {
    headers.set("x-user-name", process.env.MOCK_USER_NAME ?? DEFAULT_MOCK_USER_NAME);
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

function getApiBaseUrl(): string {
  return process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
}
