"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { deleteDocument } from "./api/delete-document";
import { updateDocument } from "./api/update-document";
import { uploadDocument } from "./api/upload-document";

function getDocumentPath(organizationId: string, projectId: string, documentId: string) {
  return `/organizations/${organizationId}/projects/${projectId}/documents/${documentId}`;
}

function getProjectPath(organizationId: string, projectId: string) {
  return `/organizations/${organizationId}/projects/${projectId}`;
}

export async function uploadDocumentAction(
  organizationId: string,
  projectId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      error: "Select a file to upload.",
    };
  }

  try {
    const apiFormData = new FormData();
    appendIfPresent(apiFormData, "name", readOptionalString(formData, "name"));
    appendIfPresent(apiFormData, "description", readOptionalString(formData, "description"));
    apiFormData.append("type", readDocumentType(formData));
    apiFormData.append("file", file, file.name);

    const document = await uploadDocument(projectId, apiFormData);
    redirect(getDocumentPath(organizationId, projectId, document.id));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to upload the document.",
    };
  }

  return {
    error: null,
  };
}

export async function updateDocumentAction(
  organizationId: string,
  projectId: string,
  documentId: string,
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readRequiredString(formData, "name");

  if (!name) {
    return {
      error: "Document name is required.",
    };
  }

  try {
    await updateDocument(documentId, {
      name,
      type: readDocumentType(formData),
      description: readOptionalString(formData, "description"),
    });

    redirect(getDocumentPath(organizationId, projectId, documentId));
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to update the document.",
    };
  }

  return {
    error: null,
  };
}

export async function deleteDocumentAction(
  organizationId: string,
  projectId: string,
  documentId: string,
): Promise<void> {
  await deleteDocument(documentId);
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

function appendIfPresent(formData: FormData, fieldName: string, value: string | null) {
  if (value) {
    formData.append(fieldName, value);
  }
}

function readDocumentType(formData: FormData):
  | "general"
  | "call_sheet"
  | "crew_list"
  | "gear_list"
  | "schedule"
  | "notes"
  | "contract"
  | "invoice"
  | "other" {
  const value = formData.get("type");

  if (
    value === "call_sheet" ||
    value === "crew_list" ||
    value === "gear_list" ||
    value === "schedule" ||
    value === "notes" ||
    value === "contract" ||
    value === "invoice" ||
    value === "other"
  ) {
    return value;
  }

  return "general";
}
