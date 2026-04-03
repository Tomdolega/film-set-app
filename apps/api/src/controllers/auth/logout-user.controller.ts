import type { NextFunction, Request, Response } from "express";

import { logoutUser, type SessionsRepository } from "@film-set-app/domain-auth";

import { clearSessionCookie, readSessionCookie } from "../../lib/session-cookie.js";
import { getRedirectPath, isBrowserFormRequest, redirectToWeb } from "./auth-form-response.js";

interface LogoutUserControllerParams {
  sessionsRepository: SessionsRepository;
}

export function createLogoutUserController(params: LogoutUserControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      await logoutUser({
        sessionId: readSessionCookie(request),
        sessionsRepository: params.sessionsRepository,
      });

      clearSessionCookie(response);

      if (isBrowserFormRequest(request)) {
        redirectToWeb(response, getRedirectPath(request, "/login"));
        return;
      }

      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
