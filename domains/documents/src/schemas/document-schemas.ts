import type { DocumentType } from "../model/document.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateDocumentInput {
  name: string | null;
  type: DocumentType;
  description: string | null;
}

export interface UpdateDocumentInput {
  name?: string;
  type?: DocumentType;
  description?: string | null;
}

export function parseCreateDocumentInput(input: unknown): CreateDocumentInput {
  const record = parseRecord(input);

  return {
    name: parseOptionalString(record.name),
    type: parseDocumentType(record.type, "general"),
    description: parseOptionalString(record.description),
  };
}

export function parseUpdateDocumentInput(input: unknown): UpdateDocumentInput {
  const record = parseRecord(input);
  const parsed: UpdateDocumentInput = {};

  if ("name" in record) {
    const name = parseOptionalString(record.name);

    if (!name) {
      throw createValidationError("name is required");
    }

    parsed.name = name;
  }

  if ("type" in record) {
    parsed.type = parseDocumentType(record.type);
  }

  if ("description" in record) {
    parsed.description = parseOptionalString(record.description);
  }

  if (Object.keys(parsed).length === 0) {
    throw createValidationError("At least one document field must be provided");
  }

  return parsed;
}

function parseRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {};
  }

  return input as Record<string, unknown>;
}

function parseOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw createValidationError("Document fields must be strings");
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDocumentType(value: unknown, fallback?: DocumentType): DocumentType {
  if (value === undefined || value === null || value === "") {
    if (fallback) {
      return fallback;
    }

    throw createValidationError("type is required");
  }

  if (
    value === "general" ||
    value === "call_sheet" ||
    value === "crew_list" ||
    value === "gear_list" ||
    value === "schedule" ||
    value === "notes" ||
    value === "contract" ||
    value === "invoice" ||
    value === "other"
  ) {
    return value;
  }

  throw createValidationError(
    "type must be one of: general, call_sheet, crew_list, gear_list, schedule, notes, contract, invoice, other",
  );
}

function createValidationError(message: string): StatusError {
  const error: StatusError = new Error(message);
  error.statusCode = 400;
  return error;
}
