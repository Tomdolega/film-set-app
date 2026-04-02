export type ContactType = "person" | "vendor" | "company";

export interface Contact {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: string[];
  type: ContactType;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactWithMembership {
  contact: Contact;
  currentUserRole: "owner" | "admin" | "member";
}

export interface ContactsListResult {
  contacts: Contact[];
  currentUserRole: "owner" | "admin" | "member";
}
