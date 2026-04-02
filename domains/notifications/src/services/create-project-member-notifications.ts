import type { CrewRepository } from "@film-set-app/domain-crew";

import type {
  NotificationRelatedEntityType,
  NotificationSeverity,
  NotificationType,
} from "../model/notification.js";
import type { NotificationsRepository } from "../repositories/notifications.repository.js";

export interface CreateProjectMemberNotificationsParams {
  projectId: string;
  organizationId: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  linkPath?: string | null;
  relatedEntityType?: NotificationRelatedEntityType | null;
  relatedEntityId?: string | null;
  crewRepository: CrewRepository;
  notificationsRepository: NotificationsRepository;
}

export async function createProjectMemberNotifications(
  params: CreateProjectMemberNotificationsParams,
): Promise<number> {
  const userIds = await listProjectNotificationRecipientUserIds({
    projectId: params.projectId,
    crewRepository: params.crewRepository,
  });

  if (userIds.length === 0) {
    return 0;
  }

  await Promise.all(
    userIds.map((userId) =>
      params.notificationsRepository.createNotification({
        userId,
        organizationId: params.organizationId,
        projectId: params.projectId,
        type: params.type,
        severity: params.severity,
        title: params.title,
        message: params.message,
        linkPath: params.linkPath ?? null,
        relatedEntityType: params.relatedEntityType ?? null,
        relatedEntityId: params.relatedEntityId ?? null,
      }),
    ),
  );

  return userIds.length;
}

export interface ListProjectNotificationRecipientUserIdsParams {
  projectId: string;
  crewRepository: CrewRepository;
}

export async function listProjectNotificationRecipientUserIds(
  params: ListProjectNotificationRecipientUserIdsParams,
): Promise<string[]> {
  const crewMembers = await params.crewRepository.listProjectCrew(params.projectId);

  return Array.from(
    new Set(
      crewMembers.flatMap((member) => {
        if (!member.userId) {
          return [];
        }

        return [member.userId];
      }),
    ),
  );
}
