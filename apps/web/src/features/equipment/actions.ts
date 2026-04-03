"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { archiveEquipmentItem } from "./api/archive-equipment-item";
import { createEquipmentItem } from "./api/create-equipment-item";
import { updateEquipmentItem } from "./api/update-equipment-item";

export async function createEquipmentItemAction(
  organizationId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readRequiredString(formData, "name");

  if (!name) {
    return {
      error: "Equipment name is required.",
    };
  }

  try {
    const equipmentItem = await createEquipmentItem({
      organizationId,
      name,
      category: readEquipmentCategory(formData, "other"),
      status: readEquipmentStatus(formData, "available"),
      description: readOptionalString(formData, "description"),
      serialNumber: readOptionalString(formData, "serialNumber"),
      notes: readOptionalString(formData, "notes"),
    });

    redirect(`/organizations/${organizationId}/equipment/${equipmentItem.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create equipment item.",
    };
  }

  return { error: null };
}

export async function updateEquipmentItemAction(
  organizationId: string,
  equipmentId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readRequiredString(formData, "name");

  if (!name) {
    return {
      error: "Equipment name is required.",
    };
  }

  try {
    await updateEquipmentItem(equipmentId, {
      name,
      category: readEquipmentCategory(formData),
      status: readEquipmentStatus(formData),
      description: readOptionalString(formData, "description"),
      serialNumber: readOptionalString(formData, "serialNumber"),
      notes: readOptionalString(formData, "notes"),
    });

    redirect(`/organizations/${organizationId}/equipment/${equipmentId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update equipment item.",
    };
  }

  return { error: null };
}

export async function archiveEquipmentItemAction(
  organizationId: string,
  equipmentId: string,
): Promise<FormState> {
  try {
    await archiveEquipmentItem(equipmentId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to archive the equipment item.",
    };
  }

  redirect(`/organizations/${organizationId}/equipment`);
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

function readEquipmentCategory(
  formData: FormData,
  fallback?: "camera" | "lens" | "audio" | "light" | "grip" | "accessory" | "other",
): "camera" | "lens" | "audio" | "light" | "grip" | "accessory" | "other" {
  const value = formData.get("category");

  if (
    value === "camera" ||
    value === "lens" ||
    value === "audio" ||
    value === "light" ||
    value === "grip" ||
    value === "accessory"
  ) {
    return value;
  }

  return fallback ?? "other";
}

function readEquipmentStatus(
  formData: FormData,
  fallback?: "available" | "reserved" | "checked_out" | "maintenance" | "unavailable",
): "available" | "reserved" | "checked_out" | "maintenance" | "unavailable" {
  const value = formData.get("status");

  if (
    value === "reserved" ||
    value === "checked_out" ||
    value === "maintenance" ||
    value === "unavailable"
  ) {
    return value;
  }

  return fallback ?? "available";
}
