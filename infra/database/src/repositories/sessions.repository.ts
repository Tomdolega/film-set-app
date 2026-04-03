import { eq } from "drizzle-orm";

import type {
  AuthSession,
  CreateSessionRecord,
  SessionWithUser,
  SessionsRepository,
} from "@film-set-app/domain-auth";

import type { Database } from "../client/db.js";
import { sessions } from "../schema/sessions.js";
import { users } from "../schema/users.js";

export class DrizzleSessionsRepository implements SessionsRepository {
  constructor(private readonly database: Database) {}

  async createSession(input: CreateSessionRecord): Promise<AuthSession> {
    const [session] = await this.database
      .insert(sessions)
      .values({
        id: input.id,
        userId: input.userId,
        expiresAt: input.expiresAt,
      })
      .returning();

    return mapSession(session);
  }

  async findSessionWithUserById(sessionId: string): Promise<SessionWithUser | null> {
    const row = await this.database
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!row[0]) {
      return null;
    }

    return {
      session: mapSession(row[0].session),
      user: {
        id: row[0].user.id,
        email: row[0].user.email,
        name: row[0].user.name,
      },
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.database.delete(sessions).where(eq(sessions.id, sessionId));
  }
}

function mapSession(row: typeof sessions.$inferSelect): AuthSession {
  return {
    id: row.id,
    userId: row.userId,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}
