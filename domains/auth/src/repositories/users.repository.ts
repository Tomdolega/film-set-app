import type { AuthUser } from "../model/auth-user.js";

export interface AuthUserAccount extends AuthUser {
  passwordHash: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAuthUserRecord {
  email: string;
  passwordHash: string | null;
  name: string | null;
}

export interface AuthUsersRepository {
  createUser: (input: CreateAuthUserRecord) => Promise<AuthUser>;
  findById: (userId: string) => Promise<AuthUserAccount | null | undefined>;
  findUserAccountByEmail: (email: string) => Promise<AuthUserAccount | null>;
}
