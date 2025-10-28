import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError, ZodIssue } from "zod";
import { AppError, AppErrorCode } from "../utils/error";

export const Validation =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.issues.map((issue: ZodIssue) => ({
          path: issue.path.join("."),
          message: issue.message,
        }));

        return next(
          new AppError(
            "Validation failed",
            400,
            AppErrorCode.VALIDATION_ERROR,
            formattedErrors
          )
        );
      }

      next(error);
    }
  };
