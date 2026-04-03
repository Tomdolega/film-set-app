import type { ShootingDayAssignmentType, ShootingDayStatus } from "../model/shooting-day.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateShootingDayInput {
  title: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: ShootingDayStatus;
}

export interface UpdateShootingDayInput {
  title?: string;
  date?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  notes?: string | null;
  status?: ShootingDayStatus;
}

export interface CreateShootingDayAssignmentInput {
  type: ShootingDayAssignmentType;
  referenceId: string;
  label: string | null;
  callTime: string | null;
}

export function parseCreateShootingDayInput(input: unknown): CreateShootingDayInput {
  const record = parseRecord(input);
  const parsed = {
    title: parseRequiredString(record.title, "title is required"),
    date: parseRequiredDate(record.date, "date is required"),
    location: parseRequiredString(record.location, "location is required"),
    startTime: parseRequiredTime(record.startTime, "startTime is required"),
    endTime: parseRequiredTime(record.endTime, "endTime is required"),
    notes: parseOptionalString(record.notes),
    status: parseShootingDayStatus(record.status, "draft"),
  };

  assertTimeRange(parsed.startTime, parsed.endTime);
  return parsed;
}

export function parseUpdateShootingDayInput(input: unknown): UpdateShootingDayInput {
  const record = parseRecord(input);
  const parsed: UpdateShootingDayInput = {};

  if ("date" in record) {
    parsed.date = parseRequiredDate(record.date, "date is required");
  }

  if ("title" in record) {
    parsed.title = parseRequiredString(record.title, "title is required");
  }

  if ("location" in record) {
    parsed.location = parseRequiredString(record.location, "location is required");
  }

  if ("startTime" in record) {
    parsed.startTime = parseRequiredTime(record.startTime, "startTime is required");
  }

  if ("endTime" in record) {
    parsed.endTime = parseRequiredTime(record.endTime, "endTime is required");
  }

  if ("notes" in record) {
    parsed.notes = parseOptionalString(record.notes);
  }

  if ("status" in record) {
    parsed.status = parseShootingDayStatus(record.status);
  }

  if (Object.keys(parsed).length === 0) {
    throw createValidationError("At least one shooting day field must be provided");
  }

  if (parsed.startTime !== undefined || parsed.endTime !== undefined) {
    const startTime = parsed.startTime ?? "00:00";
    const endTime = parsed.endTime ?? "23:59";
    assertTimeRange(startTime, endTime);
  }

  return parsed;
}

export function parseCreateShootingDayAssignmentInput(
  input: unknown,
): CreateShootingDayAssignmentInput {
  const record = parseRecord(input);

  return {
    type: parseAssignmentType(record.type),
    referenceId: parseRequiredString(record.referenceId, "referenceId is required"),
    label: parseOptionalString(record.label),
    callTime: parseOptionalTime(record.callTime),
  };
}

function parseRecord(input: unknown): Record<string, unknown> {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return {};
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

function parseOptionalString(value: unknown): string | null {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value !== "string") {
    throw createValidationError("Scheduling fields must be strings");
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseRequiredDate(value: unknown, message: string): string {
  const date = parseRequiredString(value, message);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T00:00:00.000Z`))) {
    throw createValidationError("date must use YYYY-MM-DD");
  }

  return date;
}

function parseRequiredTime(value: unknown, message: string): string {
  const time = parseRequiredString(value, message);

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw createValidationError("time must use HH:MM");
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw createValidationError("time must use HH:MM");
  }

  return time;
}

function parseOptionalTime(value: unknown): string | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  return parseRequiredTime(value, "callTime must use HH:MM");
}

function parseShootingDayStatus(value: unknown, fallback?: ShootingDayStatus): ShootingDayStatus {
  if (value === undefined || value === null || value === "") {
    if (fallback) {
      return fallback;
    }

    throw createValidationError("status is required");
  }

  if (value === "draft" || value === "locked") {
    return value;
  }

  throw createValidationError("status must be one of: draft, locked");
}

function parseAssignmentType(value: unknown): ShootingDayAssignmentType {
  if (value === "crew" || value === "equipment") {
    return value;
  }

  throw createValidationError("type must be one of: crew, equipment");
}

function assertTimeRange(startTime: string, endTime: string) {
  if (startTime >= endTime) {
    throw createValidationError("startTime must be earlier than endTime");
  }
}

function createValidationError(message: string): StatusError {
  const error: StatusError = new Error(message);
  error.statusCode = 400;
  return error;
}
