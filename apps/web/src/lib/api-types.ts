export interface OrganizationDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentUserRole: "owner" | "admin" | "member";
}

export interface ProjectDto {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  startDate: string | null;
  endDate: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  currentUserRole: "owner" | "admin" | "member";
}

export interface ContactDto {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  tags: string[];
  type: "person" | "vendor" | "company";
  createdAt: string;
  updatedAt: string;
  currentUserRole: "owner" | "admin" | "member";
}

export interface CrewMemberDto {
  id: string;
  projectId: string;
  organizationId: string;
  userId: string | null;
  contactId: string | null;
  accessRole: "owner" | "admin" | "member";
  projectRole: string | null;
  sourceType: "user" | "contact";
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  contactType: "person" | "vendor" | "company" | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentDto {
  id: string;
  organizationId: string;
  projectId: string;
  name: string;
  type:
    | "general"
    | "call_sheet"
    | "crew_list"
    | "gear_list"
    | "schedule"
    | "notes"
    | "contract"
    | "invoice"
    | "other";
  description: string | null;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  uploadedByUserId: string;
  createdAt: string;
  updatedAt: string;
  currentUserRole: "owner" | "admin" | "member";
}

export interface EquipmentDto {
  id: string;
  organizationId: string;
  name: string;
  category: "camera" | "lens" | "audio" | "light" | "grip" | "accessory" | "other";
  status: "available" | "reserved" | "checked_out" | "maintenance" | "unavailable";
  description: string | null;
  serialNumber: string | null;
  notes: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentUserRole: "owner" | "admin" | "member";
}

export interface ShootingDayDto {
  id: string;
  projectId: string;
  organizationId: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  notes: string | null;
  status: "draft" | "locked";
  createdAt: string;
  updatedAt: string;
  currentUserRole: "owner" | "admin" | "member";
}

export interface ShootingDayAssignmentDto {
  id: string;
  shootingDayId: string;
  projectId: string;
  organizationId: string;
  type: "crew" | "equipment";
  referenceId: string;
  label: string | null;
  callTime: string | null;
  createdAt: string;
  resourceName: string | null;
  crewProjectRole: string | null;
  crewAccessRole: "owner" | "admin" | "member" | null;
  equipmentCategory: "camera" | "lens" | "audio" | "light" | "grip" | "accessory" | "other" | null;
  equipmentStatus:
    | "available"
    | "reserved"
    | "checked_out"
    | "maintenance"
    | "unavailable"
    | null;
}

export interface ScheduleConflictDto {
  type: "crew_conflict" | "equipment_conflict" | "time_overlap";
  severity: "warning" | "conflict";
  message: string;
  relatedEntityId: string;
  relatedShootingDayId: string;
}

export interface CallSheetCrewEntryDto {
  assignmentId: string;
  crewMemberId: string;
  name: string;
  accessRole: "owner" | "admin" | "member";
  projectRole: string | null;
  callTime: string;
}

export interface CallSheetDto {
  shootingDayId: string;
  projectId: string;
  organizationId: string;
  date: string;
  location: string;
  startTime: string;
  endTime: string;
  callTime: string;
  notes: string | null;
  crew: CallSheetCrewEntryDto[];
}

export interface NotificationDto {
  id: string;
  userId: string;
  organizationId: string;
  projectId: string | null;
  type:
    | "project_update"
    | "crew_assignment"
    | "shooting_day_update"
    | "schedule_conflict"
    | "document_uploaded"
    | "equipment_update"
    | "generic";
  severity: "info" | "warning" | "conflict";
  title: string;
  message: string;
  isRead: boolean;
  linkPath: string | null;
  relatedEntityType:
    | "project"
    | "project_member"
    | "shooting_day"
    | "shooting_day_assignment"
    | "document"
    | "equipment_item"
    | "generic"
    | null;
  relatedEntityId: string | null;
  createdAt: string;
}

export interface NotificationsUnreadCountDto {
  count: number;
}

export interface MarkAllNotificationsAsReadDto {
  updatedCount: number;
}
