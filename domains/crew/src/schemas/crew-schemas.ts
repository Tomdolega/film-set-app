import type { CrewAccessRole } from "../model/crew-member.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface AddProjectMemberInput {
  userId: string | null;
  contactId: string | null;
  accessRole: CrewAccessRole;
  projectRole: string | null;
}

export interface UpdateProjectMemberInput {
  accessRole?: CrewAccessRole;
  projectRole?: string | null;
}

export function parseAddProjectMemberInput(input: unknown): AddProjectMemberInput {
  const record = parseRecord(input);
  const userId = parseNullableId(record.userId);
  const contactId = parseNullableId(record.contactId);

  if ((userId ? 1 : 0) + (contactId ? 1 : 0) !== 1) {
    throw createValidationError("Exactly one of userId or contactId is required");
  }

  return {
    userId,
    contactId,
    accessRole: parseAccessRole(record.accessRole, "member"),
    projectRole: parseOptionalString(record.projectRole),
  };
}

export function parseUpdateProjectMemberInput(input: unknown): UpdateProjectMemberInput {
  const record = parseRecord(input);
  const parsed: UpdateProjectMemberInput = {};

  if ("accessRole" in record) {
    parsed.accessRole = parseAccessRole(record.accessRole);
  }

  if ("projectRole" in record) {
    parsed.projectRole = parseOptionalString(record.projectRole);
  }

  if (Object.keys(parsed).length === 0) {
    throw createValidationError("At least one crew field must be provided");
  }

  return parsed;
}

function parseRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw createValidationError("Request body must be an object");
  }

  return input as Record<string, unknown>;
}

function parseNullableId(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    throw createValidationError("Crew references must be strings");
  }

  return value.trim();
}

function parseOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw createValidationError("projectRole must be a string");
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseAccessRole(value: unknown, fallback?: CrewAccessRole): CrewAccessRole {
  if (value === undefined || value === null) {
    if (fallback) {
      return fallback;
    }

    throw createValidationError("accessRole is required");
  }

  if (value === "owner" || value === "admin" || value === "member") {
    return value;
  }

  throw createValidationError("accessRole must be one of: owner, admin, member");
}

function createValidationError(message: string): StatusError {
  const error: StatusError = new Error(message);
  error.statusCode = 400;
  return error;
}
