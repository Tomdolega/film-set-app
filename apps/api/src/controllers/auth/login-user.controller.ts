import type { NextFunction, Request, Response } from "express";

import { loginUser, type SessionsRepository, type AuthUsersRepository } from "@film-set-app/domain-auth";

import { setSessionCookie } from "../../lib/session-cookie.js";
import { presentAuthUser } from "../../presenters/auth.presenter.js";
import {
  getRedirectPath,
  isBrowserFormRequest,
  redirectToWeb,
  redirectToWebWithError,
} from "./auth-form-response.js";

interface LoginUserControllerParams {
  usersRepository: AuthUsersRepository;
  sessionsRepository: SessionsRepository;
}

export function createLoginUserController(params: LoginUserControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await loginUser({
        input: request.body,
        usersRepository: params.usersRepository,
        sessionsRepository: params.sessionsRepository,
      });

      setSessionCookie(response, result.session);

      if (isBrowserFormRequest(request)) {
        redirectToWeb(response, getRedirectPath(request, "/organizations"));
        return;
      }

      response.status(200).json({
        user: presentAuthUser(result.user),
      });
    } catch (error) {
      if (isBrowserFormRequest(request)) {
        redirectToWebWithError(response, "/login", error);
        return;
      }

      next(error);
    }
  };
}
