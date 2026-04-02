import { assertProjectAccess, getSessionUser } from "@film-set-app/domain-auth";

import type {
  OrganizationAccessRepository,
  ProjectAccessRepository,
  SessionUser,
} from "@film-set-app/domain-auth";
import type { ContactsRepository } from "@film-set-app/domain-contacts";
import type { ProjectsRepository } from "@film-set-app/domain-projects";

import type { CrewMember } from "../model/crew-member.js";
import { canManageCrew } from "../permissions/crew.permissions.js";
import type { CrewRepository } from "../repositories/crew.repository.js";
import { parseAddProjectMemberInput } from "../schemas/crew-schemas.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface UserLookupRepository {
  findById: (userId: string) => Promise<{ id: string } | null | undefined>;
}

export interface AddProjectMemberParams {
  projectId: string;
  input: unknown;
  sessionUser: SessionUser | null | undefined;
  projectsRepository: ProjectsRepository & ProjectAccessRepository;
  organizationsRepository: OrganizationAccessRepository;
  contactsRepository: ContactsRepository;
  crewRepository: CrewRepository;
  usersRepository: UserLookupRepository;
}

export async function addProjectMember(params: AddProjectMemberParams): Promise<CrewMember> {
  const sessionUser = getSessionUser(params.sessionUser);
  const membership = await assertProjectAccess({
    projectId: params.projectId,
    userId: sessionUser.id,
    repository: params.projectsRepository,
  });

  if (!canManageCrew(membership.role)) {
    const error: StatusError = new Error("Project permission denied");
    error.statusCode = 403;
    throw error;
  }

  const project = await params.projectsRepository.findProjectById(params.projectId);

  if (!project) {
    const error: StatusError = new Error("Project not found");
    error.statusCode = 404;
    throw error;
  }

  const input = parseAddProjectMemberInput(params.input);

  if (input.contactId) {
    const contact = await params.contactsRepository.findContactById(input.contactId);

    if (!contact || contact.organizationId !== project.organizationId) {
      const error: StatusError = new Error("Contact not found in this organization");
      error.statusCode = 404;
      throw error;
    }

    const existingMember = await params.crewRepository.findCrewMemberByContactId(
      params.projectId,
      input.contactId,
    );

    if (existingMember) {
      const error: StatusError = new Error("Contact is already assigned to this project");
      error.statusCode = 409;
      throw error;
    }
  }

  if (input.userId) {
    const user = await params.usersRepository.findById(input.userId);

    if (!user) {
      const error: StatusError = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const organizationMembership = await params.organizationsRepository.findOrganizationMember(
      project.organizationId,
      input.userId,
    );

    if (!organizationMembership) {
      const error: StatusError = new Error(
        "User must already belong to the organization before joining project crew",
      );
      error.statusCode = 400;
      throw error;
    }

    const existingMember = await params.crewRepository.findCrewMemberByUserId(
      params.projectId,
      input.userId,
    );

    if (existingMember) {
      const error: StatusError = new Error("User is already assigned to this project");
      error.statusCode = 409;
      throw error;
    }
  }

  return params.crewRepository.createCrewMember({
    projectId: params.projectId,
    userId: input.userId,
    contactId: input.contactId,
    accessRole: input.accessRole,
    projectRole: input.projectRole,
  });
}
