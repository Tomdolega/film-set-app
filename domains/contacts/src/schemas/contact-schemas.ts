import type { ContactType } from "../model/contact.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateContactInput {
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: string[];
  type: ContactType;
}

export interface UpdateContactInput {
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tags?: string[];
  type?: ContactType;
}

export function parseCreateContactInput(input: unknown): CreateContactInput {
  const record = parseRecord(input);
  const organizationId = parseRequiredString(record.organizationId, "organizationId");
  const name = parseRequiredString(record.name, "name");

  return {
    organizationId,
    name,
    email: parseOptionalString(record.email),
    phone: parseOptionalString(record.phone),
    company: parseOptionalString(record.company),
    tags: parseTags(record.tags),
    type: parseContactType(record.type, "person"),
  };
}

export function parseUpdateContactInput(input: unknown): UpdateContactInput {
  const record = parseRecord(input);
  const parsed: UpdateContactInput = {};

  if ("name" in record) {
    parsed.name = parseRequiredString(record.name, "name");
  }

  if ("email" in record) {
    parsed.email = parseOptionalString(record.email);
  }

  if ("phone" in record) {
    parsed.phone = parseOptionalString(record.phone);
  }

  if ("company" in record) {
    parsed.company = parseOptionalString(record.company);
  }

  if ("tags" in record) {
    parsed.tags = parseTags(record.tags);
  }

  if ("type" in record) {
    parsed.type = parseContactType(record.type);
  }

  if (Object.keys(parsed).length === 0) {
    throw createValidationError("At least one contact field must be provided");
  }

  return parsed;
}

function parseRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw createValidationError("Request body must be an object");
  }

  return input as Record<string, unknown>;
}

function parseRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw createValidationError(`${fieldName} is required`);
  }

  return value.trim();
}

function parseOptionalString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw createValidationError("Optional contact fields must be strings");
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseTags(value: unknown): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw createValidationError("tags must be an array of strings");
  }

  const tags = value.map((tag) => {
    if (typeof tag !== "string") {
      throw createValidationError("tags must be an array of strings");
    }

    return tag.trim();
  });

  return Array.from(new Set(tags.filter(Boolean)));
}

function parseContactType(value: unknown, fallback?: ContactType): ContactType {
  if (value === undefined || value === null) {
    if (fallback) {
      return fallback;
    }

    throw createValidationError("type is required");
  }

  if (value === "person" || value === "vendor" || value === "company") {
    return value;
  }

  throw createValidationError("type must be one of: person, vendor, company");
}

function createValidationError(message: string): StatusError {
  const error: StatusError = new Error(message);
  error.statusCode = 400;
  return error;
}
