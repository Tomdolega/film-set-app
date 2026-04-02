import Link from "next/link";
import type { ReactNode } from "react";

import { getMockSession } from "@/lib/session";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell(props: AppShellProps) {
  const session = getMockSession();

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

