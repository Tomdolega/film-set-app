import Link from "next/link";
import type { ReactNode } from "react";

import { logoutAction } from "@/features/auth/actions";
import { getUnreadNotificationsCount } from "@/features/notifications/api/get-unread-notifications-count";
import type { AuthUserDto } from "@/lib/api-types";

interface AppShellProps {
  children: ReactNode;
  session: AuthUserDto;
}

export async function AppShell(props: AppShellProps) {
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
          <p className="sidebar__session-label">Signed in as</p>
          <strong>{props.session.name ?? props.session.email}</strong>
          <span>{props.session.email}</span>
          <form action={logoutAction} className="sidebar__logout">
            <button className="button button--secondary sidebar__logout-button" type="submit">
              Log out
            </button>
          </form>
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
