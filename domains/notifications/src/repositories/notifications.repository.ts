import type {
  Notification,
  NotificationRelatedEntityType,
  NotificationSeverity,
  NotificationType,
} from "../model/notification.js";

export interface CreateNotificationRecord {
  userId: string;
  organizationId: string;
  projectId: string | null;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  linkPath: string | null;
  relatedEntityType: NotificationRelatedEntityType | null;
  relatedEntityId: string | null;
}

export interface NotificationsRepository {
  createNotification: (input: CreateNotificationRecord) => Promise<Notification>;
  findNotificationById: (notificationId: string) => Promise<Notification | null>;
  listNotificationsByUser: (userId: string) => Promise<Notification[]>;
  countUnreadNotificationsByUser: (userId: string) => Promise<number>;
  markNotificationAsRead: (notificationId: string) => Promise<Notification | null>;
  markAllNotificationsAsRead: (userId: string) => Promise<number>;
}
