import { asc, eq } from "drizzle-orm";

import type {
  CreateDocumentRecord,
  DocumentsRepository,
  UpdateDocumentRecord,
} from "@film-set-app/domain-documents";

import type { Database } from "../client/db.js";
import { documents } from "../schema/documents.js";

export class DrizzleDocumentsRepository implements DocumentsRepository {
  constructor(private readonly database: Database) {}

  async createDocument(input: CreateDocumentRecord) {
    const [document] = await this.database
      .insert(documents)
      .values({
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
      })
      .returning();

    return document;
  }

  async findDocumentById(documentId: string) {
    return (
      (await this.database.query.documents.findFirst({
        where: eq(documents.id, documentId),
      })) ?? null
    );
  }

  async listDocumentsByProject(projectId: string) {
    return this.database
      .select()
      .from(documents)
      .where(eq(documents.projectId, projectId))
      .orderBy(asc(documents.createdAt));
  }

  async updateDocument(documentId: string, input: UpdateDocumentRecord) {
    const values: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      values.name = input.name;
    }

    if (input.type !== undefined) {
      values.type = input.type;
    }

    if (input.description !== undefined) {
      values.description = input.description;
    }

    const [document] = await this.database
      .update(documents)
      .set(values)
      .where(eq(documents.id, documentId))
      .returning();

    return document ?? null;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.database.delete(documents).where(eq(documents.id, documentId));
  }
}
