import type {
  NotificationRelatedEntityType,
  NotificationSeverity,
  NotificationType,
} from "../model/notification.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateNotificationInput {
  userId: string;
  organizationId: string;
  projectId: string | null;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  linkPath: string | null;
  relatedEntityType: NotificationRelatedEntityType | null;
  relatedEntityId: string | null;
}

export function parseCreateNotificationInput(input: unknown): CreateNotificationInput {
  const record = parseRecord(input);

  return {
    userId: parseRequiredString(record.userId, "userId is required"),
    organizationId: parseRequiredString(record.organizationId, "organizationId is required"),
    projectId: parseNullableId(record.projectId, "projectId must be a string"),
    type: parseNotificationType(record.type, "generic"),
    severity: parseNotificationSeverity(record.severity, "info"),
    title: parseRequiredString(record.title, "title is required"),
    message: parseRequiredString(record.message, "message is required"),
    linkPath: parseNullableString(record.linkPath, "linkPath must be a string"),
    relatedEntityType: parseRelatedEntityType(record.relatedEntityType),
    relatedEntityId: parseNullableId(record.relatedEntityId, "relatedEntityId must be a string"),
  };
}

function parseRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw createValidationError("Request body must be an object");
  }

  return input as Record<string, unknown>;
}

function parseRequiredString(value: unknown, message: string): string {
  if (typeof value !== "string") {
    throw createValidationError(message);
  }

  const trimmed = value.trim();

  if (!trimmed) {
    throw createValidationError(message);
  }

  return trimmed;
}

function parseNullableString(value: unknown, message: string): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw createValidationError(message);
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseNullableId(value: unknown, message: string): string | null {
  return parseNullableString(value, message);
}

function parseNotificationType(
  value: unknown,
  fallback?: NotificationType,
): NotificationType {
  if (value === undefined || value === null || value === "") {
    if (fallback) {
      return fallback;
    }

    throw createValidationError("type is required");
  }

  if (
    value === "project_update" ||
    value === "crew_assignment" ||
    value === "shooting_day_update" ||
    value === "schedule_conflict" ||
    value === "document_uploaded" ||
    value === "equipment_update" ||
    value === "generic"
  ) {
    return value;
  }

  throw createValidationError(
    "type must be one of: project_update, crew_assignment, shooting_day_update, schedule_conflict, document_uploaded, equipment_update, generic",
  );
}

function parseNotificationSeverity(
  value: unknown,
  fallback?: NotificationSeverity,
): NotificationSeverity {
  if (value === undefined || value === null || value === "") {
    if (fallback) {
      return fallback;
    }

    throw createValidationError("severity is required");
  }

  if (value === "info" || value === "warning" || value === "conflict") {
    return value;
  }

  throw createValidationError("severity must be one of: info, warning, conflict");
}

function parseRelatedEntityType(value: unknown): NotificationRelatedEntityType | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  if (
    value === "project" ||
    value === "project_member" ||
    value === "shooting_day" ||
    value === "shooting_day_assignment" ||
    value === "document" ||
    value === "equipment_item" ||
    value === "generic"
  ) {
    return value;
  }

  throw createValidationError(
    "relatedEntityType must be one of: project, project_member, shooting_day, shooting_day_assignment, document, equipment_item, generic",
  );
}

function createValidationError(message: string): StatusError {
  const error: StatusError = new Error(message);
  error.statusCode = 400;
  return error;
}
