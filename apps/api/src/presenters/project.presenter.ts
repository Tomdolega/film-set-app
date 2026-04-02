import type { ProjectWithMembership } from "@film-set-app/domain-projects";

export function presentProject(result: ProjectWithMembership) {
  return {
    id: result.project.id,
    organizationId: result.project.organizationId,
    name: result.project.name,
    description: result.project.description,
    status: result.project.status,
    startDate: result.project.startDate,
    endDate: result.project.endDate,
    createdByUserId: result.project.createdByUserId,
    createdAt: result.project.createdAt.toISOString(),
    updatedAt: result.project.updatedAt.toISOString(),
    currentUserRole: result.membership.role,
  };
}
