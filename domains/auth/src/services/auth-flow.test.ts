import test from "node:test";
import assert from "node:assert/strict";

import type {
  AuthSession,
  AuthUser,
  AuthUserAccount,
  AuthUsersRepository,
  CreateAuthUserRecord,
  CreateSessionRecord,
  SessionWithUser,
  SessionsRepository,
} from "@film-set-app/domain-auth";

import { getSession } from "./get-session.js";
import { loginUser } from "./login-user.js";
import { registerUser } from "./register-user.js";

test("registers a user with a hashed password and creates a session", async () => {
  const usersRepository = createUsersRepository();
  const sessionsRepository = createSessionsRepository(usersRepository);

  const result = await registerUser({
    input: {
      email: "owner@example.com",
      password: "password123",
      name: "Owner",
    },
    usersRepository,
    sessionsRepository,
    now: new Date("2026-04-03T10:00:00.000Z"),
  });

  const storedUser = await usersRepository.findUserAccountByEmail("owner@example.com");

  assert.ok(storedUser);
  assert.equal(result.user.email, "owner@example.com");
  assert.equal(result.session.userId, result.user.id);
  assert.notEqual(storedUser.passwordHash, "password123");
  assert.ok(storedUser.passwordHash?.startsWith("scrypt:"));
});

test("logs a user in when the password matches", async () => {
  const usersRepository = createUsersRepository();
  const sessionsRepository = createSessionsRepository(usersRepository);

  await registerUser({
    input: {
      email: "producer@example.com",
      password: "password123",
      name: "Producer",
    },
    usersRepository,
    sessionsRepository,
  });

  const result = await loginUser({
    input: {
      email: "producer@example.com",
      password: "password123",
    },
    usersRepository,
    sessionsRepository,
    now: new Date("2026-04-03T12:00:00.000Z"),
  });

  assert.equal(result.user.email, "producer@example.com");
  assert.equal(result.session.userId, result.user.id);
});

test("returns null and deletes expired sessions", async () => {
  const usersRepository = createUsersRepository();
  const sessionsRepository = createSessionsRepository(usersRepository);

  const registration = await registerUser({
    input: {
      email: "scheduler@example.com",
      password: "password123",
      name: "Scheduler",
    },
    usersRepository,
    sessionsRepository,
    now: new Date("2026-04-03T08:00:00.000Z"),
  });

  const session = await getSession({
    sessionId: registration.session.id,
    sessionsRepository,
    now: new Date("2026-04-11T08:00:00.000Z"),
  });

  assert.equal(session, null);
  assert.equal(sessionsRepository.deletedSessionIds.includes(registration.session.id), true);
});

function createUsersRepository(): InMemoryUsersRepository {
  return new InMemoryUsersRepository();
}

function createSessionsRepository(
  usersRepository: InMemoryUsersRepository,
): InMemorySessionsRepository {
  return new InMemorySessionsRepository(usersRepository);
}

class InMemoryUsersRepository implements AuthUsersRepository {
  private usersById = new Map<string, AuthUserAccount>();
  private usersByEmail = new Map<string, AuthUserAccount>();
  private nextId = 1;

  async createUser(input: CreateAuthUserRecord): Promise<AuthUser> {
    const user: AuthUserAccount = {
      id: `user-${this.nextId++}`,
      email: input.email,
      name: input.name,
      passwordHash: input.passwordHash,
      createdAt: new Date("2026-04-03T00:00:00.000Z"),
      updatedAt: new Date("2026-04-03T00:00:00.000Z"),
    };

    this.usersById.set(user.id, user);
    this.usersByEmail.set(user.email, user);

    return toAuthUser(user);
  }

  async findById(userId: string): Promise<AuthUserAccount | null> {
    return this.usersById.get(userId) ?? null;
  }

  async findUserAccountByEmail(email: string): Promise<AuthUserAccount | null> {
    return this.usersByEmail.get(email) ?? null;
  }
}

class InMemorySessionsRepository implements SessionsRepository {
  deletedSessionIds: string[] = [];
  private sessions = new Map<string, AuthSession>();

  constructor(private readonly usersRepository: InMemoryUsersRepository) {}

  async createSession(input: CreateSessionRecord): Promise<AuthSession> {
    const session: AuthSession = {
      id: input.id,
      userId: input.userId,
      expiresAt: input.expiresAt,
      createdAt: new Date("2026-04-03T00:00:00.000Z"),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  async findSessionWithUserById(sessionId: string): Promise<SessionWithUser | null> {
    const session = this.sessions.get(sessionId);

    if (!session) {
      return null;
    }

    const user = await this.usersRepository.findById(session.userId);

    if (!user) {
      return null;
    }

    return {
      session,
      user: toAuthUser(user),
    };
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.deletedSessionIds.push(sessionId);
    this.sessions.delete(sessionId);
  }
}

function toAuthUser(user: AuthUserAccount): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}
