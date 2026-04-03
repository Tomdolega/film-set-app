import type { NextFunction, Request, Response } from "express";

import {
  registerUser,
  type SessionsRepository,
  type AuthUsersRepository,
} from "@film-set-app/domain-auth";

import { setSessionCookie } from "../../lib/session-cookie.js";
import { presentAuthUser } from "../../presenters/auth.presenter.js";
import {
  getRedirectPath,
  isBrowserFormRequest,
  redirectToWeb,
  redirectToWebWithError,
} from "./auth-form-response.js";

interface RegisterUserControllerParams {
  usersRepository: AuthUsersRepository;
  sessionsRepository: SessionsRepository;
}

export function createRegisterUserController(params: RegisterUserControllerParams) {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await registerUser({
        input: request.body,
        usersRepository: params.usersRepository,
        sessionsRepository: params.sessionsRepository,
      });

      setSessionCookie(response, result.session);

      if (isBrowserFormRequest(request)) {
        redirectToWeb(response, getRedirectPath(request, "/organizations"));
        return;
      }

      response.status(201).json({
        user: presentAuthUser(result.user),
      });
    } catch (error) {
      if (isBrowserFormRequest(request)) {
        redirectToWebWithError(response, "/register", error);
        return;
      }

      next(error);
    }
  };
}
