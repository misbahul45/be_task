import { Request, Response, NextFunction } from "express";
import { AppError, AppErrorCode } from "@/utils/error";
import { Responder } from "@/utils/response";


export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return Responder.error(
      res,
      err.message,
      { code: err.code, name: err.name, details:err.details },
      err.statusCode
    );
  }

  if (err.code === "P2002") {
    return Responder.error(
      res,
      "Unique constraint failed",
      { code: AppErrorCode.UNIQUE_CONSTRAINT_FAILED, meta: err.meta },
      409
    );
  }

  if (err.code === "ECONNREFUSED") {
    return Responder.error(
      res,
      "Database connection failed",
      { code: AppErrorCode.DB_CONNECTION_ERROR },
      503
    );
  }

  if (err.name === "ZodError") {
    return Responder.error(
      res,
      "Validation error",
      { code: AppErrorCode.VALIDATION_ERROR, issues: err.errors },
      400
    );
  }

  console.error("🔥 Unhandled Error:", err);
  return Responder.error(
    res,
    "Internal Server Error",
    { code: AppErrorCode.INTERNAL_SERVER_ERROR, details: err.message },
    500
  );
};
