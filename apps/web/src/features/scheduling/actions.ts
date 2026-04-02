"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { assignShootingDayResource } from "./api/assign-shooting-day-resource";
import { createShootingDay } from "./api/create-shooting-day";
import { deleteShootingDay } from "./api/delete-shooting-day";
import { removeShootingDayAssignment } from "./api/remove-shooting-day-assignment";
import { updateShootingDay } from "./api/update-shooting-day";

function getProjectSchedulePath(organizationId: string, projectId: string) {
  return `/organizations/${organizationId}/projects/${projectId}/shooting-days`;
}

function getShootingDayPath(organizationId: string, projectId: string, shootingDayId: string) {
  return `${getProjectSchedulePath(organizationId, projectId)}/${shootingDayId}`;
}

export async function createShootingDayAction(
  organizationId: string,
  projectId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const date = readRequiredString(formData, "date");
  const location = readRequiredString(formData, "location");
  const startTime = readRequiredString(formData, "startTime");
  const endTime = readRequiredString(formData, "endTime");

  if (!date || !location || !startTime || !endTime) {
    return {
      error: "Date, location, start time, and end time are required.",
    };
  }

  try {
    const shootingDay = await createShootingDay(projectId, {
      date,
      location,
      startTime,
      endTime,
      notes: readOptionalString(formData, "notes"),
      status: readShootingDayStatus(formData),
    });

    redirect(getShootingDayPath(organizationId, projectId, shootingDay.id));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create the shooting day.",
    };
  }

  return {
    error: null,
  };
}

export async function updateShootingDayAction(
  organizationId: string,
  projectId: string,
  shootingDayId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const date = readRequiredString(formData, "date");
  const location = readRequiredString(formData, "location");
  const startTime = readRequiredString(formData, "startTime");
  const endTime = readRequiredString(formData, "endTime");

  if (!date || !location || !startTime || !endTime) {
    return {
      error: "Date, location, start time, and end time are required.",
    };
  }

  try {
    await updateShootingDay(shootingDayId, {
      date,
      location,
      startTime,
      endTime,
      notes: readOptionalString(formData, "notes"),
      status: readShootingDayStatus(formData),
    });

    redirect(getShootingDayPath(organizationId, projectId, shootingDayId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update the shooting day.",
    };
  }

  return {
    error: null,
  };
}

export async function deleteShootingDayAction(
  organizationId: string,
  projectId: string,
  shootingDayId: string,
): Promise<void> {
  await deleteShootingDay(shootingDayId);
  redirect(getProjectSchedulePath(organizationId, projectId));
}

export async function assignCrewToShootingDayAction(
  organizationId: string,
  projectId: string,
  shootingDayId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const referenceId = readRequiredString(formData, "referenceId");

  if (!referenceId) {
    return {
      error: "Select a crew member to assign.",
    };
  }

  try {
    await assignShootingDayResource(shootingDayId, {
      type: "crew",
      referenceId,
      label: readOptionalString(formData, "label"),
      callTime: readOptionalString(formData, "callTime"),
    });

    redirect(getShootingDayPath(organizationId, projectId, shootingDayId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to assign the crew member.",
    };
  }

  return {
    error: null,
  };
}

export async function assignEquipmentToShootingDayAction(
  organizationId: string,
  projectId: string,
  shootingDayId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const referenceId = readRequiredString(formData, "referenceId");

  if (!referenceId) {
    return {
      error: "Select an equipment item to assign.",
    };
  }

  try {
    await assignShootingDayResource(shootingDayId, {
      type: "equipment",
      referenceId,
      label: readOptionalString(formData, "label"),
      callTime: null,
    });

    redirect(getShootingDayPath(organizationId, projectId, shootingDayId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to assign the equipment item.",
    };
  }

  return {
    error: null,
  };
}

export async function removeShootingDayAssignmentAction(
  organizationId: string,
  projectId: string,
  shootingDayId: string,
  assignmentId: string,
): Promise<void> {
  await removeShootingDayAssignment(shootingDayId, assignmentId);
  redirect(getShootingDayPath(organizationId, projectId, shootingDayId));
}

function readRequiredString(formData: FormData, fieldName: string): string {
  const value = formData.get(fieldName);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalString(formData: FormData, fieldName: string): string | null {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readShootingDayStatus(formData: FormData): "draft" | "locked" {
  const value = formData.get("status");

  if (value === "locked") {
    return value;
  }

  return "draft";
}
