import { and, desc, eq, sql } from "drizzle-orm";

import type {
  CreateNotificationRecord,
  Notification,
  NotificationRelatedEntityType,
  NotificationsRepository,
} from "@film-set-app/domain-notifications";

import type { Database } from "../client/db.js";
import { notifications, type NotificationRow } from "../schema/notifications.js";

export class DrizzleNotificationsRepository implements NotificationsRepository {
  constructor(private readonly database: Database) {}

  async createNotification(input: CreateNotificationRecord) {
    const [notification] = await this.database
      .insert(notifications)
      .values({
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
      })
      .returning();

    return mapNotification(notification);
  }

  async findNotificationById(notificationId: string) {
    const notification =
      (await this.database.query.notifications.findFirst({
        where: eq(notifications.id, notificationId),
      })) ?? null;

    return notification ? mapNotification(notification) : null;
  }

  async listNotificationsByUser(userId: string) {
    const rows = await this.database
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));

    return rows.map(mapNotification);
  }

  async countUnreadNotificationsByUser(userId: string) {
    const rows = await this.database
      .select({
        count: sql<number>`count(*)::int`,
      })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));

    return rows[0]?.count ?? 0;
  }

  async markNotificationAsRead(notificationId: string) {
    const [notification] = await this.database
      .update(notifications)
      .set({
        isRead: true,
      })
      .where(eq(notifications.id, notificationId))
      .returning();

    return notification ? mapNotification(notification) : null;
  }

  async markAllNotificationsAsRead(userId: string) {
    const updated = await this.database
      .update(notifications)
      .set({
        isRead: true,
      })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .returning({
        id: notifications.id,
      });

    return updated.length;
  }
}

function mapNotification(row: NotificationRow): Notification {
  return {
    ...row,
    relatedEntityType: row.relatedEntityType as NotificationRelatedEntityType | null,
  };
}
