import type { UploadedDocumentFile } from "./model/document.js";

export interface StoredDocumentFile {
  storageKey: string;
}

export interface DocumentsStorage {
  saveFile: (input: {
    projectId: string;
    file: UploadedDocumentFile;
  }) => Promise<StoredDocumentFile>;
  deleteFile: (storageKey: string) => Promise<void>;
}
