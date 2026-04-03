import type { NextFunction, Request, Response } from "express";

import { getTrustedOrigins } from "../lib/runtime-config.js";

export function createCorsMiddleware() {
  const trustedOrigins = new Set(getTrustedOrigins());

  return (request: Request, response: Response, next: NextFunction) => {
    const origin = request.headers.origin;

    if (!origin) {
      next();
      return;
    }

    if (!trustedOrigins.has(origin)) {
      if (request.method === "OPTIONS") {
        response.status(403).json({
          error: {
            message: "Origin not allowed",
          },
        });
        return;
      }

      next();
      return;
    }

    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
    response.setHeader("Vary", "Origin");
    response.setHeader(
      "Access-Control-Allow-Headers",
      request.headers["access-control-request-headers"] ?? "Content-Type",
    );
    response.setHeader(
      "Access-Control-Allow-Methods",
      "GET,POST,PATCH,DELETE,OPTIONS",
    );

    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    next();
  };
}
