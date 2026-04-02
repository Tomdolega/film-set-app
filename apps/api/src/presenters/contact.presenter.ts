import type { Contact, ContactWithMembership } from "@film-set-app/domain-contacts";

export function presentContact(result: ContactWithMembership) {
  return presentContactRecord(result.contact, result.currentUserRole);
}

export function presentContactRecord(
  contact: Contact,
  currentUserRole: "owner" | "admin" | "member",
) {
  return {
    id: contact.id,
    organizationId: contact.organizationId,
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    tags: contact.tags,
    type: contact.type,
    createdAt: contact.createdAt.toISOString(),
    updatedAt: contact.updatedAt.toISOString(),
    currentUserRole,
  };
}
