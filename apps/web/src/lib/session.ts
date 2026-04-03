import { redirect } from "next/navigation";

import type { AuthMeDto, AuthUserDto } from "./api-types";
import { apiRequest } from "./api-client";

export async function getCurrentSession(): Promise<AuthUserDto | null> {
  const response = await apiRequest<AuthMeDto>("/auth/me");
  return response.user;
}

export async function requireCurrentSession(): Promise<AuthUserDto> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}
