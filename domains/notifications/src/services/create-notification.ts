import type { Notification } from "../model/notification.js";
import type { NotificationsRepository } from "../repositories/notifications.repository.js";
import { parseCreateNotificationInput } from "../schemas/notification-schemas.js";

export interface CreateNotificationParams {
  input: unknown;
  notificationsRepository: NotificationsRepository;
}

export async function createNotification(params: CreateNotificationParams): Promise<Notification> {
  const input = parseCreateNotificationInput(params.input);

  return params.notificationsRepository.createNotification({
    userId: input.userId,
    organizationId: input.organizationId,
    projectId: input.projectId,
    type: input.type,
    severity: input.severity,
    title: input.title,
    message: input.message,
    linkPath: input.linkPath,
    relatedEntityType: input.relatedEntityType,
    relatedEntityId: input.relatedEntityId,
  });
}
