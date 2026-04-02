import Link from "next/link";
import type { ReactNode } from "react";

import { getUnreadNotificationsCount } from "@/features/notifications/api/get-unread-notifications-count";
import { getMockSession } from "@/lib/session";

interface AppShellProps {
  children: ReactNode;
}

export async function AppShell(props: AppShellProps) {
  const session = getMockSession();
  const unreadCount = await getUnreadCount();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <Link href="/" className="sidebar__title">
            Film Set App
          </Link>
          <p className="sidebar__subtitle">MVP web interface</p>
        </div>

        <nav className="sidebar__nav">
          <Link href="/organizations" className="sidebar__link">
            Organizations
          </Link>
          <Link href="/notifications" className="sidebar__link">
            <span>Notifications</span>
            {unreadCount > 0 ? <span className="sidebar__badge">{unreadCount}</span> : null}
          </Link>
        </nav>

        <div className="sidebar__session">
          <p className="sidebar__session-label">Mock session</p>
          <strong>{session.name}</strong>
          <span>{session.email}</span>
        </div>
      </aside>

      <div className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Authenticated shell</p>
            <h1 className="topbar__title">Organizations and projects</h1>
          </div>
        </header>

        <main className="page">{props.children}</main>
      </div>
    </div>
  );
}

async function getUnreadCount(): Promise<number> {
  try {
    return await getUnreadNotificationsCount();
  } catch {
    return 0;
  }
}
