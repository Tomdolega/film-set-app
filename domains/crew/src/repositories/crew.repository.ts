import type { CrewAccessRole, CrewMember } from "../model/crew-member.js";

export interface CreateCrewMemberRecord {
  projectId: string;
  userId: string | null;
  contactId: string | null;
  accessRole: CrewAccessRole;
  projectRole: string | null;
}

export interface UpdateCrewMemberRecord {
  accessRole?: CrewAccessRole;
  projectRole?: string | null;
}

export interface CrewRepository {
  createCrewMember: (input: CreateCrewMemberRecord) => Promise<CrewMember>;
  findCrewMemberById: (projectMemberId: string) => Promise<CrewMember | null>;
  findCrewMemberByUserId: (projectId: string, userId: string) => Promise<CrewMember | null>;
  findCrewMemberByContactId: (projectId: string, contactId: string) => Promise<CrewMember | null>;
  listProjectCrew: (projectId: string) => Promise<CrewMember[]>;
  countCrewMembersByAccessRole: (projectId: string, accessRole: CrewAccessRole) => Promise<number>;
  updateCrewMember: (
    projectMemberId: string,
    input: UpdateCrewMemberRecord,
  ) => Promise<CrewMember | null>;
  removeCrewMember: (projectMemberId: string) => Promise<void>;
}
