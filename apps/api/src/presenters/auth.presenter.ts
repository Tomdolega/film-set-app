import type { AuthUser } from "@film-set-app/domain-auth";

export function presentAuthUser(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
