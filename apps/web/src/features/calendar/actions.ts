"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { exportShootingDayToCalendar } from "./api/export-shooting-day-to-calendar";
import { importCalendarEvent } from "./api/import-calendar-event";

export interface ExportCalendarFormState {
  error: string | null;
  externalEventId: string | null;
  eventTitle: string | null;
}

export const initialExportCalendarFormState: ExportCalendarFormState = {
  error: null,
  externalEventId: null,
  eventTitle: null,
};

export async function exportShootingDayToCalendarAction(
  shootingDayId: string,
  _previousState: ExportCalendarFormState,
  formData: FormData,
): Promise<ExportCalendarFormState> {
  const provider = formData.get("provider");

  try {
    const result = await exportShootingDayToCalendar(shootingDayId, {
      provider: provider === "google" ? "google" : "google",
    });

    return {
      error: null,
      externalEventId: result.externalEventId,
      eventTitle: result.event.title,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to export the shooting day.",
      externalEventId: null,
      eventTitle: null,
    };
  }
}

export async function importCalendarEventAction(
  organizationId: string,
  projectId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const eventJson = readRequiredString(formData, "eventJson");

  if (!eventJson) {
    return {
      error: "Paste a calendar event JSON payload to import.",
    };
  }

  let parsedEvent: unknown;

  try {
    parsedEvent = JSON.parse(eventJson) as never;
  } catch {
    return {
      error: "Calendar event JSON must be valid JSON.",
    };
  }

  try {
    const result = await importCalendarEvent({
      projectId,
      organizationId,
      event: parsedEvent as never,
    });

    redirect(
      `/organizations/${organizationId}/projects/${projectId}/shooting-days/${result.shootingDay.id}`,
    );
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to import the calendar event.",
    };
  }

  return {
    error: null,
  };
}

function readRequiredString(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}
