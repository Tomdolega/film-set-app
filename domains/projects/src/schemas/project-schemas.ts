import { PROJECT_STATUSES, type ProjectStatus } from "../model/project-status.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateProjectInput {
  organizationId: string;
  name: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

export function parseCreateProjectInput(input: unknown): CreateProjectInput {
  const value = requireObject(input, "Project payload is required");
  const organizationId = requireString(value.organizationId, "organizationId is required");
  const name = requireString(value.name, "name is required");
  const startDate = optionalDateString(value.startDate);
  const endDate = optionalDateString(value.endDate);

  assertProjectDateRange(startDate ?? null, endDate ?? null);

  return {
    organizationId,
    name,
    description: optionalString(value.description),
    startDate,
    endDate,
  };
}

export function parseUpdateProjectInput(input: unknown): UpdateProjectInput {
  const value = requireObject(input, "Project payload is required");
  const result: UpdateProjectInput = {};

  if ("name" in value) {
    result.name = requireString(value.name, "name must be a non-empty string");
  }

  if ("description" in value) {
    result.description = optionalString(value.description);
  }

  if ("status" in value) {
    result.status = requireProjectStatus(value.status);
  }

  if ("startDate" in value) {
    result.startDate = optionalDateString(value.startDate);
  }

  if ("endDate" in value) {
    result.endDate = optionalDateString(value.endDate);
  }

  if (Object.keys(result).length === 0) {
    const error: StatusError = new Error("At least one project field must be provided");
    error.statusCode = 400;
    throw error;
  }

  if (result.startDate !== undefined && result.endDate !== undefined) {
    assertProjectDateRange(result.startDate ?? null, result.endDate ?? null);
  }

  return result;
}

export function assertProjectDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): void {
  if (startDate && endDate && startDate > endDate) {
    const error: StatusError = new Error("Project start date must be on or before the end date");
    error.statusCode = 400;
    throw error;
  }
}

function requireObject(value: unknown, message: string): Record<string, unknown> {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  const error: StatusError = new Error(message);
  error.statusCode = 400;
  throw error;
}

function requireString(value: unknown, message: string): string {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  const error: StatusError = new Error(message);
  error.statusCode = 400;
  throw error;
}

function optionalString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  const error: StatusError = new Error("Expected a string or null");
  error.statusCode = 400;
  throw error;
}

function optionalDateString(value: unknown): string | null | undefined {
  const parsed = optionalString(value);

  if (parsed === undefined || parsed === null) {
    return parsed;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(parsed)) {
    return parsed;
  }

  const error: StatusError = new Error("Dates must use YYYY-MM-DD");
  error.statusCode = 400;
  throw error;
}

function requireProjectStatus(value: unknown): ProjectStatus {
  if (typeof value === "string" && PROJECT_STATUSES.includes(value as ProjectStatus)) {
    return value as ProjectStatus;
  }

  const error: StatusError = new Error("Invalid project status");
  error.statusCode = 400;
  throw error;
}
