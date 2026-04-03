import { randomUUID } from "node:crypto";

import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { CrewRepository } from "@film-set-app/domain-crew";
import {
  createProjectMemberNotifications,
  type NotificationsRepository,
} from "@film-set-app/domain-notifications";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { DocumentsStorage } from "../documents.storage.js";
import type { DocumentWithMembership, UploadedDocumentFile } from "../model/document.js";
import { canManageDocuments } from "../permissions/documents.permissions.js";
import type { DocumentsRepository } from "../repositories/documents.repository.js";
import { parseCreateDocumentInput } from "../schemas/document-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface CreateDocumentParams {
  projectId: string;
  input: unknown;
  file: UploadedDocumentFile | null | undefined;
  sessionUser: SessionUser | null | undefined;
  crewRepository: CrewRepository;
  notificationsRepository: NotificationsRepository;
  projectsRepository: ProjectsRepository;
  documentsRepository: DocumentsRepository;
  documentsStorage: DocumentsStorage;
}

export async function createDocument(params: CreateDocumentParams): Promise<DocumentWithMembership> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canManageDocuments(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  if (!params.file) {
    const error: StatusError = new Error("file is required");
    error.statusCode = 400;
    throw error;
  }

  const project = await params.projectsRepository.findProjectById(params.projectId);

  if (!project) {
    const error: StatusError = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const input = parseCreateDocumentInput(params.input);
  const documentId = randomUUID();
  const originalFilename = getOriginalFilename(params.file.originalName);
  const storedFile = await params.documentsStorage.saveFile({
    organizationId: project.organizationId,
    projectId: params.projectId,
    documentId,
    file: params.file,
  });

  try {
    const document = await params.documentsRepository.createDocument({
      id: documentId,
      organizationId: project.organizationId,
      projectId: project.id,
      name: input.name ?? originalFilename,
      type: input.type,
      description: input.description,
      originalFilename,
      storageKey: storedFile.storageKey,
      mimeType: params.file.mimeType,
      fileSize: params.file.size,
      uploadedByUserId: sessionUser.id,
    });

    await createProjectMemberNotifications({
      projectId: project.id,
      organizationId: project.organizationId,
      type: "document_uploaded",
      severity: "info",
      title: "New document uploaded",
      message: `${document.name} was uploaded to ${project.name}.`,
      linkPath: getDocumentLinkPath(project.organizationId, project.id, document.id),
      relatedEntityType: "document",
      relatedEntityId: document.id,
      excludeUserIds: [sessionUser.id],
      crewRepository: params.crewRepository,
      notificationsRepository: params.notificationsRepository,
    });

    return {
      document,
      currentUserRole: membership.role,
    };
  } catch (error) {
    await params.documentsStorage.deleteFile(storedFile.storageKey);
    throw error;
  }
}

function getDocumentLinkPath(
  organizationId: string,
  projectId: string,
  documentId: string,
) {
  return `/organizations/${organizationId}/projects/${projectId}/documents/${documentId}`;
}

function getOriginalFilename(fileName: string): string {
  const normalized = fileName.split(/[/\\]/).pop()?.trim() ?? "";
  return normalized || "document";
}
