import type { EquipmentCategory, EquipmentStatus } from "../model/equipment-item.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateEquipmentItemInput {
  organizationId: string;
  name: string;
  category: EquipmentCategory;
  status: EquipmentStatus;
  description: string | null;
  serialNumber: string | null;
  notes: string | null;
}

export interface UpdateEquipmentItemInput {
  name?: string;
  category?: EquipmentCategory;
  status?: EquipmentStatus;
  description?: string | null;
  serialNumber?: string | null;
  notes?: string | null;
}

export function parseCreateEquipmentItemInput(input: unknown): CreateEquipmentItemInput {
  const record = parseRecord(input);

  return {
    organizationId: parseRequiredString(record.organizationId, "organizationId"),
    name: parseRequiredString(record.name, "name"),
    category: parseEquipmentCategory(record.category, "other"),
    status: parseEquipmentStatus(record.status, "available"),
    description: parseOptionalString(record.description),
    serialNumber: parseOptionalString(record.serialNumber),
    notes: parseOptionalString(record.notes),
  };
}

export function parseUpdateEquipmentItemInput(input: unknown): UpdateEquipmentItemInput {
  const record = parseRecord(input);
  const parsed: UpdateEquipmentItemInput = {};

  if ("name" in record) {
    parsed.name = parseRequiredString(record.name, "name");
  }

  if ("category" in record) {
    parsed.category = parseEquipmentCategory(record.category);
  }

  if ("status" in record) {
    parsed.status = parseEquipmentStatus(record.status);
  }

  if ("description" in record) {
    parsed.description = parseOptionalString(record.description);
  }

  if ("serialNumber" in record) {
    parsed.serialNumber = parseOptionalString(record.serialNumber);
  }

  if ("notes" in record) {
    parsed.notes = parseOptionalString(record.notes);
  }

  if (Object.keys(parsed).length === 0) {
    throw createValidationError("At least one equipment field must be provided");
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
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw createValidationError("Optional equipment fields must be strings");
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseEquipmentCategory(
  value: unknown,
  fallback?: EquipmentCategory,
): EquipmentCategory {
  if (value === undefined || value === null || value === "") {
    if (fallback) {
      return fallback;
    }

    throw createValidationError("category is required");
  }

  if (
    value === "camera" ||
    value === "lens" ||
    value === "audio" ||
    value === "light" ||
    value === "grip" ||
    value === "accessory" ||
    value === "other"
  ) {
    return value;
  }

  throw createValidationError(
    "category must be one of: camera, lens, audio, light, grip, accessory, other",
  );
}

function parseEquipmentStatus(value: unknown, fallback?: EquipmentStatus): EquipmentStatus {
  if (value === undefined || value === null || value === "") {
    if (fallback) {
      return fallback;
    }

    throw createValidationError("status is required");
  }

  if (
    value === "available" ||
    value === "reserved" ||
    value === "checked_out" ||
    value === "maintenance" ||
    value === "unavailable"
  ) {
    return value;
  }

  throw createValidationError(
    "status must be one of: available, reserved, checked_out, maintenance, unavailable",
  );
}

function createValidationError(message: string): StatusError {
  const error: StatusError = new Error(message);
  error.statusCode = 400;
  return error;
}
