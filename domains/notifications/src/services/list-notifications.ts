import { getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";

import type { Notification } from "../model/notification.js";
import type { NotificationsRepository } from "../repositories/notifications.repository.js";

export interface ListNotificationsParams {
  sessionUser: SessionUser | null | undefined;
  notificationsRepository: NotificationsRepository;
}

export async function listNotifications(
  params: ListNotificationsParams,
): Promise<Notification[]> {
  const sessionUser = getSessionUser(params.sessionUser);

  return params.notificationsRepository.listNotificationsByUser(sessionUser.id);
}
