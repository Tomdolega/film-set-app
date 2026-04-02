import type { Contact, ContactType } from "../model/contact.js";

export interface CreateContactRecord {
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: string[];
  type: ContactType;
}

export interface UpdateContactRecord {
  name?: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  tags?: string[];
  type?: ContactType;
}

export interface ContactsRepository {
  createContact: (input: CreateContactRecord) => Promise<Contact>;
  findContactById: (contactId: string) => Promise<Contact | null>;
  listContactsByOrganization: (organizationId: string) => Promise<Contact[]>;
  updateContact: (contactId: string, input: UpdateContactRecord) => Promise<Contact | null>;
}
