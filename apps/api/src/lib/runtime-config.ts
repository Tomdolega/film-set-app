const DEFAULT_API_URL = "http://localhost:3001";
const DEFAULT_WEB_URL = "http://localhost:3000";
const DEFAULT_DOCUMENT_UPLOAD_MAX_BYTES = 20 * 1024 * 1024;

export function getApiUrl(): string {
  return readUrlEnvironmentValue("API_URL", "API_BASE_URL", DEFAULT_API_URL);
}

export function getWebUrl(): string {
  return readUrlEnvironmentValue("WEB_URL", "WEB_BASE_URL", DEFAULT_WEB_URL);
}

export function getTrustedOrigins(): string[] {
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins && configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return [getWebUrl()];
}

export function getDocumentUploadMaxBytes(): number {
  const value = process.env.DOCUMENT_UPLOAD_MAX_BYTES?.trim();

  if (!value) {
    return DEFAULT_DOCUMENT_UPLOAD_MAX_BYTES;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed;
  }

  throw new Error("DOCUMENT_UPLOAD_MAX_BYTES must be a positive integer.");
}

export function getTrustProxySetting(): boolean | number {
  const value = process.env.TRUST_PROXY?.trim();

  if (!value) {
    return false;
  }

  if (value === "true") {
    return 1;
  }

  if (value === "false") {
    return false;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isInteger(parsed) && parsed >= 0) {
    return parsed;
  }

  throw new Error("TRUST_PROXY must be true, false, or a non-negative integer.");
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
