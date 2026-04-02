import { getSessionUser } from "@film-set-app/domain-auth";
import type { SessionUser } from "@film-set-app/domain-auth";

import type { NotificationsRepository } from "../repositories/notifications.repository.js";

export interface GetUnreadNotificationsCountParams {
  sessionUser: SessionUser | null | undefined;
  notificationsRepository: NotificationsRepository;
}

export async function getUnreadNotificationsCount(
  params: GetUnreadNotificationsCountParams,
): Promise<number> {
  const sessionUser = getSessionUser(params.sessionUser);

  return params.notificationsRepository.countUnreadNotificationsByUser(sessionUser.id);
}
