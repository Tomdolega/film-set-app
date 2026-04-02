import type { SessionUser } from "../model/session-user.js";

interface StatusError extends Error {
  statusCode?: number;
}

export function getSessionUser(sessionUser: SessionUser | null | undefined): SessionUser {
  if (sessionUser) {
    return sessionUser;
  }

  const error: StatusError = new Error("Authentication required");
  error.statusCode = 401;
  throw error;
}
