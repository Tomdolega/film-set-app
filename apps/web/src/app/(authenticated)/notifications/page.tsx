import { ErrorNotice } from "@/components/error-notice";
import { getUnreadNotificationsCount } from "@/features/notifications/api/get-unread-notifications-count";
import { listNotifications } from "@/features/notifications/api/list-notifications";
import { MarkAllNotificationsReadForm } from "@/features/notifications/components/mark-all-notifications-read-form";
import { NotificationsList } from "@/features/notifications/components/notifications-list";

export default async function NotificationsPage() {
  try {
    const [notifications, unreadCount] = await Promise.all([
      listNotifications(),
      getUnreadNotificationsCount(),
    ]);

    return (
      <div className="stack stack--large">
        <section className="panel">
          <p className="eyebrow">Notifications</p>
          <div className="panel__header">
            <div>
              <h2>Your inbox</h2>
              <p>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                  : "All notifications are marked as read."}
              </p>
            </div>
            <MarkAllNotificationsReadForm disabled={unreadCount === 0} />
          </div>
        </section>

        <NotificationsList notifications={notifications} />
      </div>
    );
  } catch (error) {
    return (
      <div className="stack stack--large">
        <ErrorNotice
          message={error instanceof Error ? error.message : "Unable to load notifications."}
        />
      </div>
    );
  }
}
