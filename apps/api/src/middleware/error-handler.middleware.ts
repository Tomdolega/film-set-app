import type { ErrorRequestHandler } from "express";
import multer from "multer";

import { getDatabaseErrorMessage, isDatabaseConnectionError } from "@film-set-app/infra-database";

interface ErrorWithStatus extends Error {
  statusCode?: number;
}

export function createErrorHandler(): ErrorRequestHandler {
  return (error, _request, response, _next) => {
    const typedError = error as ErrorWithStatus;
    const databaseConnectionError = isDatabaseConnectionError(error);
    const multerError = error instanceof multer.MulterError;
    const statusCode =
      typedError.statusCode ?? (multerError ? 400 : databaseConnectionError ? 503 : 500);

    if (statusCode >= 500) {
      console.error(error);
    }

    response.status(statusCode).json({
      error: {
        message:
          typedError.statusCode !== undefined
            ? typedError.message
            : multerError
              ? typedError.message
            : databaseConnectionError
              ? getDatabaseErrorMessage(error)
              : "Internal server error",
      },
    });
  };
}
