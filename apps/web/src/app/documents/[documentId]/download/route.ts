import { NextResponse } from "next/server";

import { getSessionCookieHeader } from "@/lib/session-cookie";
import { getApiUrl } from "@/lib/runtime-config";

interface DownloadRouteContext {
  params: Promise<{
    documentId: string;
  }>;
}

export async function GET(_request: Request, context: DownloadRouteContext) {
  const { documentId } = await context.params;
  const cookieHeader = await getSessionCookieHeader();
  const response = await fetch(`${getApiUrl()}/documents/${documentId}/download`, {
    method: "GET",
    cache: "no-store",
    redirect: "manual",
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
  });

  const location = response.headers.get("location");

  if (response.status >= 300 && response.status < 400 && location) {
    return NextResponse.redirect(location);
  }

  let message = "Unable to download the document.";

  try {
    const parsed = (await response.json()) as { error?: { message?: string } };
    if (parsed.error?.message) {
      message = parsed.error.message;
    }
  } catch {
    // Keep the default message.
  }

  return NextResponse.json(
    {
      error: {
        message,
      },
    },
    { status: response.ok ? 500 : response.status },
  );
}
