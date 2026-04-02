export type CrewAccessRole = "owner" | "admin" | "member";
export type CrewSourceType = "user" | "contact";
export type CrewContactType = "person" | "vendor" | "company";

export interface CrewMember {
  id: string;
  projectId: string;
  organizationId: string;
  userId: string | null;
  contactId: string | null;
  accessRole: CrewAccessRole;
  projectRole: string | null;
  sourceType: CrewSourceType;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  contactType: CrewContactType | null;
  createdAt: Date;
  updatedAt: Date;
}
