import { getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";

import type { NotificationsMarkAllReadResult } from "../model/notification.js";
import type { NotificationsRepository } from "../repositories/notifications.repository.js";

export interface MarkAllNotificationsAsReadParams {
  sessionUser: SessionUser | null | undefined;
  notificationsRepository: NotificationsRepository;
}

export async function markAllNotificationsAsRead(
  params: MarkAllNotificationsAsReadParams,
): Promise<NotificationsMarkAllReadResult> {
  const sessionUser = getSessionUser(params.sessionUser);
  const updatedCount = await params.notificationsRepository.markAllNotificationsAsRead(
    sessionUser.id,
  );

  return {
    updatedCount,
  };
}
