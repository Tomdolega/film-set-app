import type { Document, DocumentType } from "../model/document.js";

export interface CreateDocumentRecord {
  organizationId: string;
  projectId: string;
  name: string;
  type: DocumentType;
  description: string | null;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  uploadedByUserId: string;
}

export interface UpdateDocumentRecord {
  name?: string;
  type?: DocumentType;
  description?: string | null;
}

export interface DocumentsRepository {
  createDocument: (input: CreateDocumentRecord) => Promise<Document>;
  findDocumentById: (documentId: string) => Promise<Document | null>;
  listDocumentsByProject: (projectId: string) => Promise<Document[]>;
  updateDocument: (documentId: string, input: UpdateDocumentRecord) => Promise<Document | null>;
  deleteDocument: (documentId: string) => Promise<void>;
}
