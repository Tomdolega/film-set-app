import type { CrewMember } from "@film-set-app/domain-crew";

export function presentCrewMember(member: CrewMember) {
  return {
    id: member.id,
    projectId: member.projectId,
    organizationId: member.organizationId,
    userId: member.userId,
    contactId: member.contactId,
    accessRole: member.accessRole,
    projectRole: member.projectRole,
    sourceType: member.sourceType,
    name: member.name,
    email: member.email,
    phone: member.phone,
    company: member.company,
    contactType: member.contactType,
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  };
}
