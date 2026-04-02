import { getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";

import type { Notification } from "../model/notification.js";
import type { NotificationsRepository } from "../repositories/notifications.repository.js";

interface StatusError extends Error {
  statusCode?: number;
}

export interface MarkNotificationAsReadParams {
  notificationId: string;
  sessionUser: SessionUser | null | undefined;
  notificationsRepository: NotificationsRepository;
}

export async function markNotificationAsRead(
  params: MarkNotificationAsReadParams,
): Promise<Notification> {
  const sessionUser = getSessionUser(params.sessionUser);
  const notification = await params.notificationsRepository.findNotificationById(
    params.notificationId,
  );

  if (!notification || notification.userId !== sessionUser.id) {
    const error: StatusError = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  if (notification.isRead) {
    return notification;
  }

  const updated = await params.notificationsRepository.markNotificationAsRead(
    params.notificationId,
  );

  if (!updated) {
    const error: StatusError = new Error("Notification not found");
    error.statusCode = 404;
    throw error;
  }

  return updated;
}
