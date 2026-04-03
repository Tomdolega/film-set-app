"use server";

import { redirect } from "next/navigation";

import type { FormState } from "@/lib/form-state";

import { markAllNotificationsAsRead } from "./api/mark-all-notifications-as-read";
import { markNotificationAsRead } from "./api/mark-notification-as-read";

export async function markNotificationAsReadAction(notificationId: string): Promise<FormState> {
  try {
    await markNotificationAsRead(notificationId);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to mark the notification as read.",
    };
  }

  redirect("/notifications");
}

export async function markAllNotificationsAsReadAction(): Promise<FormState> {
  try {
    await markAllNotificationsAsRead();
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Unable to mark notifications as read.",
    };
  }

  redirect("/notifications");
}
