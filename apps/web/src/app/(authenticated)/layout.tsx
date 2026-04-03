import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { requireCurrentSession } from "@/lib/session";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default async function AuthenticatedLayout(props: AuthenticatedLayoutProps) {
  const session = await requireCurrentSession();

  return <AppShell session={session}>{props.children}</AppShell>;
}
