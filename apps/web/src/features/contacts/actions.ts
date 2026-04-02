"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { createContact } from "./api/create-contact";
import { updateContact } from "./api/update-contact";

export async function createContactAction(
  organizationId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readRequiredString(formData, "name");

  if (!name) {
    return {
      error: "Contact name is required.",
    };
  }

  try {
    const contact = await createContact({
      organizationId,
      name,
      email: readOptionalString(formData, "email"),
      phone: readOptionalString(formData, "phone"),
      company: readOptionalString(formData, "company"),
      tags: readTags(formData),
      type: readContactType(formData, "person"),
    });

    redirect(`/organizations/${organizationId}/contacts/${contact.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create contact.",
    };
  }

  return {
    error: null,
  };
}

export async function updateContactAction(
  organizationId: string,
  contactId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readRequiredString(formData, "name");

  if (!name) {
    return {
      error: "Contact name is required.",
    };
  }

  try {
    await updateContact(contactId, {
      name,
      email: readOptionalString(formData, "email"),
      phone: readOptionalString(formData, "phone"),
      company: readOptionalString(formData, "company"),
      tags: readTags(formData),
      type: readContactType(formData),
    });

    redirect(`/organizations/${organizationId}/contacts/${contactId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update contact.",
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

function readOptionalString(formData: FormData, fieldName: string): string | null {
  const value = formData.get(fieldName);

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function readTags(formData: FormData): string[] {
  const rawValue = formData.get("tags");

  if (typeof rawValue !== "string") {
    return [];
  }

  const tags = rawValue
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return Array.from(new Set(tags));
}

function readContactType(
  formData: FormData,
  fallback?: "person" | "vendor" | "company",
): "person" | "vendor" | "company" {
  const value = formData.get("type");

  if (value === "vendor" || value === "company") {
    return value;
  }

  return fallback ?? "person";
}
