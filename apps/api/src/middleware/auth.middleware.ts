import type { NextFunction, Request, Response } from "express";

import type { SessionUser } from "@film-set-app/domain-auth";
import type { DrizzleUsersRepository } from "@film-set-app/infra-database";

const DEFAULT_MOCK_USER_ID = "11111111-1111-1111-1111-111111111111";
const DEFAULT_MOCK_USER_EMAIL = "owner@example.com";
const DEFAULT_MOCK_USER_NAME = "Mock Owner";

export interface AuthenticatedRequest extends Request {
  sessionUser?: SessionUser;
}

interface CreateAuthMiddlewareParams {
  usersRepository: DrizzleUsersRepository;
}

export function createAuthMiddleware(params: CreateAuthMiddlewareParams) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const sessionUser = resolveMockSessionUser(request);

      // TODO: replace this mock session flow with real auth in a later batch.
      await params.usersRepository.upsertSessionUser(sessionUser);
      (request as AuthenticatedRequest).sessionUser = sessionUser;

      next();
    } catch (error) {
      next(error);
    }
  };
}

function resolveMockSessionUser(request: Request): SessionUser {
  const userId = readHeader(request, "x-user-id") ?? process.env.MOCK_USER_ID ?? DEFAULT_MOCK_USER_ID;
  const email =
    readHeader(request, "x-user-email") ?? process.env.MOCK_USER_EMAIL ?? DEFAULT_MOCK_USER_EMAIL;
  const name =
    readHeader(request, "x-user-name") ?? process.env.MOCK_USER_NAME ?? DEFAULT_MOCK_USER_NAME;

  return {
    id: userId,
    email,
    name,
  };
}

function readHeader(request: Request, headerName: string): string | undefined {
  const value = request.headers[headerName];

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return undefined;
}
