import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware.js";
import { presentAuthUser } from "../../presenters/auth.presenter.js";

export function createGetCurrentUserController() {
  return (request: Request, response: Response) => {
    const sessionUser = (request as AuthenticatedRequest).sessionUser;

    response.status(200).json({
      user: sessionUser ? presentAuthUser(sessionUser) : null,
    });
  };
}
