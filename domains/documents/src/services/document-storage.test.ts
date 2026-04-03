import assert from "node:assert/strict";
import test from "node:test";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import type { NotificationsRepository } from "@film-set-app/domain-notifications";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { DocumentsStorage } from "../documents.storage.js";
import type { Document, UploadedDocumentFile } from "../model/document.js";
import type {
  DocumentsRepository,
  UpdateDocumentRecord,
} from "../repositories/documents.repository.js";
import { createDocument } from "./create-document.js";
import { getDocumentDownload } from "./get-document-download.js";

const sessionUser: SessionUser = {
  id: "user-1",
  email: "owner@example.com",
  name: "Owner",
};

test("uploads a file to storage and persists original filename metadata", async () => {
  const documentsStorage = new InMemoryDocumentsStorage();
  const documentsRepository = new InMemoryDocumentsRepository();
  const projectsRepository = createProjectsRepository();

  const result = await createDocument({
    projectId: "project-1",
    input: {
      type: "call_sheet",
    },
    file: createUploadedFile(),
    sessionUser,
    crewRepository: createCrewRepository(),
    notificationsRepository: createNotificationsRepository(),
    projectsRepository,
    documentsRepository,
    documentsStorage,
  });

  assert.equal(result.document.projectId, "project-1");
  assert.equal(result.document.organizationId, "organization-1");
  assert.equal(result.document.originalFilename, "Call Sheet Final.pdf");
  assert.equal(result.document.name, "Call Sheet Final.pdf");
  assert.ok(documentsStorage.savedInput);
  assert.equal(documentsStorage.savedInput?.organizationId, "organization-1");
  assert.equal(documentsStorage.savedInput?.projectId, "project-1");
  assert.equal(documentsStorage.savedInput?.documentId, result.document.id);
  assert.match(documentsStorage.savedInput?.documentId ?? "", /^[0-9a-f-]{36}$/);
});

test("creates a signed download URL only after project access is verified", async () => {
  const documentsStorage = new InMemoryDocumentsStorage();
  const documentsRepository = new InMemoryDocumentsRepository({
    id: "document-1",
    organizationId: "organization-1",
    projectId: "project-1",
    name: "Camera notes",
    type: "notes",
    description: null,
    originalFilename: "Camera Notes.pdf",
    storageKey: "organizations/organization-1/projects/project-1/documents/document-1/camera-notes.pdf",
    mimeType: "application/pdf",
    fileSize: 128,
    uploadedByUserId: sessionUser.id,
    createdAt: new Date("2026-04-03T10:00:00.000Z"),
    updatedAt: new Date("2026-04-03T10:00:00.000Z"),
  });
  const projectsRepository = createProjectsRepository();

  const result = await getDocumentDownload({
    documentId: "document-1",
    sessionUser,
    projectsRepository,
    documentsRepository,
    documentsStorage,
  });

  assert.equal(result.downloadUrl, "https://storage.example.com/signed/document-1");
  assert.deepEqual(documentsStorage.lastGetFileUrlInput, {
    storageKey:
      "organizations/organization-1/projects/project-1/documents/document-1/camera-notes.pdf",
    fileName: "Camera Notes.pdf",
  });
});

class InMemoryDocumentsStorage implements DocumentsStorage {
  savedInput:
    | {
        organizationId: string;
        projectId: string;
        documentId: string;
        file: UploadedDocumentFile;
      }
    | null = null;
  lastGetFileUrlInput: { storageKey: string; fileName: string } | null = null;

  async saveFile(input: {
    organizationId: string;
    projectId: string;
    documentId: string;
    file: UploadedDocumentFile;
  }) {
    this.savedInput = input;

    return {
      storageKey: `organizations/${input.organizationId}/projects/${input.projectId}/documents/${input.documentId}/call-sheet-final.pdf`,
    };
  }

  async deleteFile(_storageKey: string): Promise<void> {}

  async getFileUrl(input: { storageKey: string; fileName: string }): Promise<string> {
    this.lastGetFileUrlInput = input;
    return "https://storage.example.com/signed/document-1";
  }
}

class InMemoryDocumentsRepository implements DocumentsRepository {
  constructor(private readonly existingDocument: Document | null = null) {}

  async createDocument(input: Parameters<DocumentsRepository["createDocument"]>[0]): Promise<Document> {
    return {
      id: input.id,
      organizationId: input.organizationId,
      projectId: input.projectId,
      name: input.name,
      type: input.type,
      description: input.description,
      originalFilename: input.originalFilename,
      storageKey: input.storageKey,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
      uploadedByUserId: input.uploadedByUserId,
      createdAt: new Date("2026-04-03T09:00:00.000Z"),
      updatedAt: new Date("2026-04-03T09:00:00.000Z"),
    };
  }

  async findDocumentById(documentId: string): Promise<Document | null> {
    if (this.existingDocument?.id === documentId) {
      return this.existingDocument;
    }

    return null;
  }

  async listDocumentsByProject(_projectId: string): Promise<Document[]> {
    return [];
  }

  async updateDocument(
    _documentId: string,
    _input: UpdateDocumentRecord,
  ): Promise<Document | null> {
    return null;
  }

  async deleteDocument(_documentId: string): Promise<void> {}
}

function createProjectsRepository(): ProjectsRepository {
  return {
    async createProject() {
      throw new Error("Not implemented in test");
    },
    async addProjectMember() {
      throw new Error("Not implemented in test");
    },
    async findProjectById(projectId: string) {
      if (projectId !== "project-1") {
        return null;
      }

      return {
        id: "project-1",
        organizationId: "organization-1",
        name: "Project One",
        description: null,
        status: "draft",
        startDate: null,
        endDate: null,
        createdByUserId: sessionUser.id,
        createdAt: new Date("2026-04-03T08:00:00.000Z"),
        updatedAt: new Date("2026-04-03T08:00:00.000Z"),
      };
    },
    async findProjectMember(projectId: string, userId: string) {
      if (projectId !== "project-1" || userId !== sessionUser.id) {
        return null;
      }

      return {
        projectId,
        userId,
        role: "owner",
        createdAt: new Date("2026-04-03T08:00:00.000Z"),
      };
    },
    async listProjectsForUser() {
      return [];
    },
    async updateProject() {
      return null;
    },
  };
}

function createCrewRepository(): CrewRepository {
  return {
    async createCrewMember() {
      throw new Error("Not implemented in test");
    },
    async findCrewMemberById() {
      return null;
    },
    async findCrewMemberByUserId() {
      return null;
    },
    async findCrewMemberByContactId() {
      return null;
    },
    async listProjectCrew() {
      return [];
    },
    async countCrewMembersByAccessRole() {
      return 0;
    },
    async updateCrewMember() {
      return null;
    },
    async removeCrewMember() {},
  };
}

function createNotificationsRepository(): NotificationsRepository {
  return {
    async createNotification() {
      return {
        id: "notification-1",
        userId: "user-2",
        organizationId: "organization-1",
        projectId: "project-1",
        type: "document_uploaded",
        severity: "info",
        title: "New document uploaded",
        message: "Document uploaded",
        isRead: false,
        linkPath: null,
        relatedEntityType: "document",
        relatedEntityId: "document-1",
        createdAt: new Date("2026-04-03T09:00:00.000Z"),
      };
    },
    async findNotificationById() {
      return null;
    },
    async listNotificationsByUser() {
      return [];
    },
    async countUnreadNotificationsByUser() {
      return 0;
    },
    async markNotificationAsRead() {
      return null;
    },
    async markAllNotificationsAsRead() {
      return 0;
    },
  };
}

function createUploadedFile(): UploadedDocumentFile {
  return {
    originalName: "Call Sheet Final.pdf",
    mimeType: "application/pdf",
    size: 128,
    buffer: Buffer.from("pdf"),
  };
}
