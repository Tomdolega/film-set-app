export type DocumentType =
  | "general"
  | "call_sheet"
  | "crew_list"
  | "gear_list"
  | "schedule"
  | "notes"
  | "contract"
  | "invoice"
  | "other";

export interface Document {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  type: DocumentType;
  description: string | null;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  uploadedByUserId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentWithMembership {
  document: Document;
  currentUserRole: "owner" | "admin" | "member";
}

export interface DocumentsListResult {
  documents: Document[];
  currentUserRole: "owner" | "admin" | "member";
}

export interface UploadedDocumentFile {
  originalName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
}
