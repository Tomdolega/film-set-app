import type { NextFunction, Request, Response } from "express";

import { getSession, type SessionUser, type SessionsRepository } from "@film-set-app/domain-auth";

import { readSessionCookie } from "../lib/session-cookie.js";

export interface AuthenticatedRequest extends Request {
  sessionUser: SessionUser | null;
}

interface CreateAuthMiddlewareParams {
  sessionsRepository: SessionsRepository;
}

export function createAuthMiddleware(params: CreateAuthMiddlewareParams) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const sessionId = readSessionCookie(request);
      const session = await getSession({
        sessionId,
        sessionsRepository: params.sessionsRepository,
      });

      (request as AuthenticatedRequest).sessionUser = session?.user ?? null;
      next();
    } catch (error) {
      next(error);
    }
  };
}
