import { eq } from "drizzle-orm";

import type {
  AuthUser,
  AuthUserAccount,
  AuthUsersRepository,
  CreateAuthUserRecord,
} from "@film-set-app/domain-auth";

import type { Database } from "../client/db.js";
import { users } from "../schema/users.js";

export class DrizzleUsersRepository implements AuthUsersRepository {
  constructor(private readonly database: Database) {}

  async createUser(input: CreateAuthUserRecord): Promise<AuthUser> {
    const [user] = await this.database
      .insert(users)
      .values({
        email: input.email,
        passwordHash: input.passwordHash,
        name: input.name,
      })
      .returning();

    return mapAuthUser(user);
  }

  async findById(userId: string) {
    const user =
      (await this.database.query.users.findFirst({
        where: eq(users.id, userId),
      })) ?? null;

    return user ? mapAuthUserAccount(user) : null;
  }

  async findUserAccountByEmail(email: string): Promise<AuthUserAccount | null> {
    const user =
      (await this.database.query.users.findFirst({
        where: eq(users.email, email),
      })) ?? null;

    return user ? mapAuthUserAccount(user) : null;
  }

  async upsertUser(input: {
    id: string;
    email: string;
    name: string | null;
    passwordHash: string | null;
  }): Promise<AuthUser> {
    const [user] = await this.database
      .insert(users)
      .values({
        id: input.id,
        email: input.email,
        name: input.name,
        passwordHash: input.passwordHash,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: input.email,
          name: input.name,
          passwordHash: input.passwordHash,
          updatedAt: new Date(),
        },
      })
      .returning();

    return mapAuthUser(user);
  }
}

function mapAuthUser(row: typeof users.$inferSelect): AuthUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
  };
}

function mapAuthUserAccount(row: typeof users.$inferSelect): AuthUserAccount {
  return {
    ...mapAuthUser(row),
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
