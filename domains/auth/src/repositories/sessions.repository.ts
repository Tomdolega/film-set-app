import type { AuthSession } from "../model/auth-session.js";
import type { AuthUser } from "../model/auth-user.js";

export interface CreateSessionRecord {
  id: string;
  userId: string;
  expiresAt: Date;
}

export interface SessionWithUser {
  session: AuthSession;
  user: AuthUser;
}

export interface SessionsRepository {
  createSession: (input: CreateSessionRecord) => Promise<AuthSession>;
  findSessionWithUserById: (sessionId: string) => Promise<SessionWithUser | null>;
  deleteSession: (sessionId: string) => Promise<void>;
}
