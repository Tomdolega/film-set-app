"use server";

import { redirect } from "next/navigation";

import { markAllNotificationsAsRead } from "./api/mark-all-notifications-as-read";
import { markNotificationAsRead } from "./api/mark-notification-as-read";

export async function markNotificationAsReadAction(notificationId: string): Promise<void> {
  await markNotificationAsRead(notificationId);
  redirect("/notifications");
}

export async function markAllNotificationsAsReadAction(): Promise<void> {
  await markAllNotificationsAsRead();
  redirect("/notifications");
}
