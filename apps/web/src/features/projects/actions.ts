"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { createProject } from "./api/create-project";
import { updateProject } from "./api/update-project";

export async function createProjectAction(
  organizationId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readRequiredString(formData, "name");

  if (!name) {
    return {
      error: "Project name is required.",
    };
  }

  try {
    const project = await createProject({
      organizationId,
      name,
      description: readOptionalString(formData, "description"),
      startDate: readOptionalString(formData, "startDate"),
      endDate: readOptionalString(formData, "endDate"),
    });

    redirect(`/organizations/${organizationId}/projects/${project.id}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to create project.",
    };
  }

  return {
    error: null,
  };
}

export async function updateProjectAction(
  organizationId: string,
  projectId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readRequiredString(formData, "name");

  if (!name) {
    return {
      error: "Project name is required.",
    };
  }

  try {
    await updateProject(projectId, {
      name,
      description: readOptionalString(formData, "description"),
      status: readStatus(formData),
      startDate: readOptionalString(formData, "startDate"),
      endDate: readOptionalString(formData, "endDate"),
    });

    redirect(`/organizations/${organizationId}/projects/${projectId}`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update project.",
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

function readStatus(formData: FormData): "draft" | "active" | "archived" {
  const value = formData.get("status");

  if (value === "active" || value === "archived") {
    return value;
  }

  return "draft";
}
