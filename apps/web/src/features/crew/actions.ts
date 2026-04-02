"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { addProjectMember } from "./api/add-project-member";
import { removeProjectMember } from "./api/remove-project-member";
import { updateProjectMember } from "./api/update-project-member";

function getProjectPath(organizationId: string, projectId: string) {
  return `/organizations/${organizationId}/projects/${projectId}`;
}

export async function addCrewMemberAction(
  organizationId: string,
  projectId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const contactId = readRequiredString(formData, "contactId");

  if (!contactId) {
    return {
      error: "Select a contact to add to the project crew.",
    };
  }

  try {
    await addProjectMember(projectId, {
      contactId,
      accessRole: readAccessRole(formData),
      projectRole: readOptionalString(formData, "projectRole"),
    });

    redirect(getProjectPath(organizationId, projectId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to add the crew member.",
    };
  }

  return {
    error: null,
  };
}

export async function updateCrewMemberAction(
  organizationId: string,
  projectId: string,
  projectMemberId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await updateProjectMember(projectId, projectMemberId, {
      accessRole: readAccessRole(formData),
      projectRole: readOptionalString(formData, "projectRole"),
    });

    redirect(getProjectPath(organizationId, projectId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update the crew member.",
    };
  }

  return {
    error: null,
  };
}

export async function removeCrewMemberAction(
  organizationId: string,
  projectId: string,
  projectMemberId: string,
): Promise<void> {
  await removeProjectMember(projectId, projectMemberId);
  redirect(getProjectPath(organizationId, projectId));
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

function readAccessRole(formData: FormData): "owner" | "admin" | "member" {
  const value = formData.get("accessRole");

  if (value === "owner" || value === "admin") {
    return value;
  }

  return "member";
}
