import type {
  Notification,
  NotificationsMarkAllReadResult,
} from "@film-set-app/domain-notifications";

export function presentNotification(notification: Notification) {
  return {
    id: notification.id,
    userId: notification.userId,
    organizationId: notification.organizationId,
    projectId: notification.projectId,
    type: notification.type,
    severity: notification.severity,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    linkPath: notification.linkPath,
    relatedEntityType: notification.relatedEntityType,
    relatedEntityId: notification.relatedEntityId,
    createdAt: notification.createdAt.toISOString(),
  };
}

export function presentNotifications(notifications: Notification[]) {
  return notifications.map(presentNotification);
}

export function presentUnreadNotificationsCount(count: number) {
  return {
    count,
  };
}

export function presentMarkAllNotificationsAsReadResult(
  result: NotificationsMarkAllReadResult,
) {
  return {
    updatedCount: result.updatedCount,
  };
}
