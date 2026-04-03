import { Router } from "express";

import type { SessionsRepository, AuthUsersRepository } from "@film-set-app/domain-auth";

import { createGetCurrentUserController } from "../controllers/auth/get-current-user.controller.js";
import { createLoginUserController } from "../controllers/auth/login-user.controller.js";
import { createLogoutUserController } from "../controllers/auth/logout-user.controller.js";
import { createRegisterUserController } from "../controllers/auth/register-user.controller.js";

interface CreateAuthRouterParams {
  usersRepository: AuthUsersRepository;
  sessionsRepository: SessionsRepository;
}

export function createAuthRouter(params: CreateAuthRouterParams) {
  const router = Router();

  router.post("/register", createRegisterUserController(params));
  router.post("/login", createLoginUserController(params));
  router.post("/logout", createLogoutUserController(params));
  router.get("/me", createGetCurrentUserController());

  return router;
}
