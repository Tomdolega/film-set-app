"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { createOrganization } from "./api/create-organization";

export async function createOrganizationAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const rawName = formData.get("name");
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (!name) {
    return {
      error: "Organization name is required.",
    };
  }

  try {
    const organization = await createOrganization({ name });
    redirect(`/organizations/${organization.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create organization.",
    };
  }

  return {
    error: null,
  };
}
