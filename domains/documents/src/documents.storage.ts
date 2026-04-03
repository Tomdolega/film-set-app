import type { UploadedDocumentFile } from "./model/document.js";

export interface StoredDocumentFile {
  storageKey: string;
}

export interface DocumentsStorage {
  saveFile: (input: {
    organizationId: string;
    projectId: string;
    documentId: string;
    file: UploadedDocumentFile;
  }) => Promise<StoredDocumentFile>;
  deleteFile: (storageKey: string) => Promise<void>;
  getFileUrl: (input: {
    storageKey: string;
    fileName: string;
  }) => Promise<string>;
}
