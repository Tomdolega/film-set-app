import { and, asc, eq, isNull } from "drizzle-orm";

import type {
  CreateEquipmentItemRecord,
  EquipmentRepository,
  UpdateEquipmentItemRecord,
} from "@film-set-app/domain-equipment";

import type { Database } from "../client/db.js";
import { equipmentItems } from "../schema/equipment-items.js";

export class DrizzleEquipmentRepository implements EquipmentRepository {
  constructor(private readonly database: Database) {}

  async createEquipmentItem(input: CreateEquipmentItemRecord) {
    const [equipmentItem] = await this.database
      .insert(equipmentItems)
      .values({
        organizationId: input.organizationId,
        name: input.name,
        category: input.category,
        status: input.status,
        description: input.description,
        serialNumber: input.serialNumber,
        notes: input.notes,
      })
      .returning();

    return equipmentItem;
  }

  async findEquipmentItemById(equipmentId: string) {
    return (
      (await this.database.query.equipmentItems.findFirst({
        where: eq(equipmentItems.id, equipmentId),
      })) ?? null
    );
  }

  async listEquipmentItemsByOrganization(
    organizationId: string,
    options?: { includeArchived?: boolean },
  ) {
    const includeArchived = options?.includeArchived ?? false;

    return this.database
      .select()
      .from(equipmentItems)
      .where(
        includeArchived
          ? eq(equipmentItems.organizationId, organizationId)
          : and(eq(equipmentItems.organizationId, organizationId), isNull(equipmentItems.archivedAt)),
      )
      .orderBy(asc(equipmentItems.createdAt));
  }

  async updateEquipmentItem(equipmentId: string, input: UpdateEquipmentItemRecord) {
    const values: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      values.name = input.name;
    }

    if (input.category !== undefined) {
      values.category = input.category;
    }

    if (input.status !== undefined) {
      values.status = input.status;
    }

    if (input.description !== undefined) {
      values.description = input.description;
    }

    if (input.serialNumber !== undefined) {
      values.serialNumber = input.serialNumber;
    }

    if (input.notes !== undefined) {
      values.notes = input.notes;
    }

    const [equipmentItem] = await this.database
      .update(equipmentItems)
      .set(values)
      .where(eq(equipmentItems.id, equipmentId))
      .returning();

    return equipmentItem ?? null;
  }

  async archiveEquipmentItem(equipmentId: string) {
    const [equipmentItem] = await this.database
      .update(equipmentItems)
      .set({
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(equipmentItems.id, equipmentId))
      .returning();

    return equipmentItem ?? null;
  }
}
