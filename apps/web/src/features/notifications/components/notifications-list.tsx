import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import type { NotificationDto } from "@/lib/api-types";
import { MarkNotificationReadForm } from "./mark-notification-read-form";

interface NotificationsListProps {
  notifications: NotificationDto[];
}

export function NotificationsList(props: NotificationsListProps) {
  if (props.notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        description="Important project activity will appear here once schedule, crew, and document changes happen."
      />
    );
  }

  return (
    <div className="notifications-list">
      {props.notifications.map((notification) => {
        return (
          <article
            key={notification.id}
            className={`list-card notification-card${notification.isRead ? "" : " notification-card--unread"}`}
          >
            <div className="stack stack--tight notification-card__content">
              <div className="notification-card__meta">
                <div className="notification-card__meta-group">
                  <span className={`pill pill--${notification.severity}`}>
                    {formatSeverity(notification.severity)}
                  </span>
                  <span className="pill">{formatType(notification.type)}</span>
                  {notification.isRead ? <span className="pill">Read</span> : <span className="pill">Unread</span>}
                </div>
                <span className="notification-card__timestamp">
                  {formatDateTime(notification.createdAt)}
                </span>
              </div>

              <div>
                <strong>{notification.title}</strong>
                <p>{notification.message}</p>
              </div>

              {notification.linkPath ? (
                <Link href={notification.linkPath} className="text-link">
                  Open related page
                </Link>
              ) : null}
            </div>

            {!notification.isRead ? (
              <MarkNotificationReadForm notificationId={notification.id} />
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatSeverity(severity: NotificationDto["severity"]): string {
  if (severity === "conflict") {
    return "Conflict";
  }

  if (severity === "warning") {
    return "Warning";
  }

  return "Info";
}

function formatType(type: NotificationDto["type"]): string {
  return type.replaceAll("_", " ");
}
