import type { Document, DocumentWithMembership } from "@film-set-app/domain-documents";

export function presentDocument(result: DocumentWithMembership) {
  return presentDocumentRecord(result.document, result.currentUserRole);
}

export function presentDocumentRecord(
  document: Document,
  currentUserRole: "owner" | "admin" | "member",
) {
  return {
    id: document.id,
    organizationId: document.organizationId,
    projectId: document.projectId,
    name: document.name,
    type: document.type,
    description: document.description,
    storageKey: document.storageKey,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    uploadedByUserId: document.uploadedByUserId,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    currentUserRole,
  };
}
