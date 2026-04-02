import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import { AppProviders } from "@/providers/app-providers";

import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Film Set App",
  description: "Batch 1 organizations and projects web app.",
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout(props: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <AppShell>{props.children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}

