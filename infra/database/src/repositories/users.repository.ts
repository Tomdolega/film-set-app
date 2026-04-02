import { eq } from "drizzle-orm";

import type { SessionUser } from "@film-set-app/domain-auth";

import type { Database } from "../client/db.js";
import { users } from "../schema/users.js";

export class DrizzleUsersRepository {
  constructor(private readonly database: Database) {}

  async upsertSessionUser(user: SessionUser): Promise<void> {
    await this.database
      .insert(users)
      .values({
        id: user.id,
        email: user.email,
        name: user.name,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: user.email,
          name: user.name,
          updatedAt: new Date(),
        },
      });
  }

  async findById(userId: string) {
    return this.database.query.users.findFirst({
      where: eq(users.id, userId),
    });
  }
}
