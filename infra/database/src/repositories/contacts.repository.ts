import { asc, eq } from "drizzle-orm";

import type { ContactsRepository, CreateContactRecord, UpdateContactRecord } from "@film-set-app/domain-contacts";

import type { Database } from "../client/db.js";
import { contacts } from "../schema/contacts.js";

export class DrizzleContactsRepository implements ContactsRepository {
  constructor(private readonly database: Database) {}

  async createContact(input: CreateContactRecord) {
    const [contact] = await this.database
      .insert(contacts)
      .values({
        organizationId: input.organizationId,
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        tags: input.tags,
        type: input.type,
      })
      .returning();

    return contact;
  }

  async findContactById(contactId: string) {
    return (
      (await this.database.query.contacts.findFirst({
        where: eq(contacts.id, contactId),
      })) ?? null
    );
  }

  async listContactsByOrganization(organizationId: string) {
    return this.database
      .select()
      .from(contacts)
      .where(eq(contacts.organizationId, organizationId))
      .orderBy(asc(contacts.createdAt));
  }

  async updateContact(contactId: string, input: UpdateContactRecord) {
    const values: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      values.name = input.name;
    }

    if (input.email !== undefined) {
      values.email = input.email;
    }

    if (input.phone !== undefined) {
      values.phone = input.phone;
    }

    if (input.company !== undefined) {
      values.company = input.company;
    }

    if (input.tags !== undefined) {
      values.tags = input.tags;
    }

    if (input.type !== undefined) {
      values.type = input.type;
    }

    const [contact] = await this.database
      .update(contacts)
      .set(values)
      .where(eq(contacts.id, contactId))
      .returning();

    return contact ?? null;
  }
}
