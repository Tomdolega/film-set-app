const DEFAULT_API_URL = "http://localhost:3001";
const DEFAULT_WEB_URL = "http://localhost:3000";

export function getApiUrl(): string {
  return readUrlEnvironmentValue("API_URL", "API_BASE_URL", DEFAULT_API_URL);
}

export function getWebUrl(): string {
  return readUrlEnvironmentValue("WEB_URL", "WEB_BASE_URL", DEFAULT_WEB_URL);
}

function readUrlEnvironmentValue(
  primaryName: string,
  legacyName: string,
  developmentFallback: string,
): string {
  const value = process.env[primaryName]?.trim() || process.env[legacyName]?.trim();

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV !== "production") {
    return developmentFallback;
  }

  throw new Error(`${primaryName} is required in production.`);
}
