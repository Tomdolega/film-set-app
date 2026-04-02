export type NotificationSeverity = "info" | "warning" | "conflict";
export type NotificationType =
  | "project_update"
  | "crew_assignment"
  | "shooting_day_update"
  | "schedule_conflict"
  | "document_uploaded"
  | "equipment_update"
  | "generic";
export type NotificationRelatedEntityType =
  | "project"
  | "project_member"
  | "shooting_day"
  | "shooting_day_assignment"
  | "document"
  | "equipment_item"
  | "generic";

export interface Notification {
  id: string;
  userId: string;
  organizationId: string;
  projectId: string | null;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  isRead: boolean;
  linkPath: string | null;
  relatedEntityType: NotificationRelatedEntityType | null;
  relatedEntityId: string | null;
  createdAt: Date;
}

export interface NotificationsMarkAllReadResult {
  updatedCount: number;
}
