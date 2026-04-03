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
    originalFilename: document.originalFilename,
    mimeType: document.mimeType,
    fileSize: document.fileSize,
    uploadedByUserId: document.uploadedByUserId,
    downloadPath: getDocumentDownloadPath(document.id),
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
    currentUserRole,
  };
}

function getDocumentDownloadPath(documentId: string) {
  return `/documents/${documentId}/download`;
}
