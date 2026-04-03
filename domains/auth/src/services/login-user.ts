import type { AuthSession } from "../model/auth-session.js";
import type { AuthUser } from "../model/auth-user.js";
import type { SessionsRepository } from "../repositories/sessions.repository.js";
import type { AuthUsersRepository } from "../repositories/users.repository.js";
import {
  createSessionExpiry,
  createSessionId,
  normalizeEmail,
  normalizePassword,
  validateEmail,
  validatePassword,
} from "./register-user.js";
import { verifyPassword } from "./password-hasher.js";

interface StatusError extends Error {
  statusCode?: number;
}

interface LoginUserInput {
  email?: string | null;
  password?: string | null;
}

export interface LoginUserParams {
  input: LoginUserInput;
  usersRepository: AuthUsersRepository;
  sessionsRepository: SessionsRepository;
  now?: Date;
}

export interface LoginUserResult {
  user: AuthUser;
  session: AuthSession;
}

export async function loginUser(params: LoginUserParams): Promise<LoginUserResult> {
  const email = normalizeEmail(params.input.email);
  const password = normalizePassword(params.input.password);

  validateEmail(email);
  validatePassword(password);

  const user = await params.usersRepository.findUserAccountByEmail(email);

  if (!user?.passwordHash) {
    throwInvalidCredentialsError();
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    throwInvalidCredentialsError();
  }

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

function throwInvalidCredentialsError(): never {
  const error: StatusError = new Error("Invalid email or password");
  error.statusCode = 401;
  throw error;
}
