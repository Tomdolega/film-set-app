import { randomBytes } from "node:crypto";

import { SESSION_TTL_MS } from "../constants/session.js";
import type { AuthSession } from "../model/auth-session.js";
import type { AuthUser } from "../model/auth-user.js";
import type { SessionsRepository } from "../repositories/sessions.repository.js";
import type { AuthUsersRepository } from "../repositories/users.repository.js";
import { hashPassword } from "./password-hasher.js";

interface StatusError extends Error {
  statusCode?: number;
}

interface RegisterUserInput {
  email?: string | null;
  password?: string | null;
  name?: string | null;
}

export interface RegisterUserParams {
  input: RegisterUserInput;
  usersRepository: AuthUsersRepository;
  sessionsRepository: SessionsRepository;
  now?: Date;
}

export interface AuthResult {
  user: AuthUser;
  session: AuthSession;
}

export async function registerUser(params: RegisterUserParams): Promise<AuthResult> {
  const email = normalizeEmail(params.input.email);
  const password = normalizePassword(params.input.password);
  const name = normalizeName(params.input.name);

  validateEmail(email);
  validatePassword(password);

  const existingUser = await params.usersRepository.findUserAccountByEmail(email);

  if (existingUser) {
    const error: StatusError = new Error("An account with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await params.usersRepository.createUser({
    email,
    passwordHash,
    name,
  });
  const session = await params.sessionsRepository.createSession({
    id: createSessionId(),
    userId: user.id,
    expiresAt: createSessionExpiry(params.now),
  });

  return {
    user,
    session,
  };
}

export function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? "";
}

export function normalizePassword(password: string | null | undefined): string {
  return typeof password === "string" ? password : "";
}

export function normalizeName(name: string | null | undefined): string | null {
  const normalized = name?.trim() ?? "";
  return normalized ? normalized : null;
}

export function validateEmail(email: string): void {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    const error: StatusError = new Error("A valid email address is required");
    error.statusCode = 400;
    throw error;
  }
}

export function validatePassword(password: string): void {
  if (password.length < 8) {
    const error: StatusError = new Error("Password must be at least 8 characters");
    error.statusCode = 400;
    throw error;
  }
}

export function createSessionId(): string {
  return randomBytes(32).toString("hex");
}

export function createSessionExpiry(now = new Date()): Date {
  return new Date(now.getTime() + SESSION_TTL_MS);
}
