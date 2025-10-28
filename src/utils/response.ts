import { Response as ExpressResponse } from "express";
import { ApiResponse, MetaResponse } from "@/types/app.type";

export class Responder {
  static success<T>(
    res: ExpressResponse,
    message: string,
    data: T | null = null,
    meta?: MetaResponse
  ): ExpressResponse<ApiResponse<T>> {
    const response: ApiResponse<T> = {
      success:true,
      message,
      error: null,
      data,
      ...(meta && { meta }),
    };

    return res.status(200).json(response);
  }

  static error(
    res: ExpressResponse,
    message: string,
    error: string | Record<string, any> | null = null,
    statusCode = 500,
    data: any = null
  ): ExpressResponse<ApiResponse> {
    const response: ApiResponse = {
      success:false,
      message,
      error: error
        ? typeof error === "string"
          ? error
          : { ...error }
        : "Internal Server Error",
      data,
    };

    return res.status(statusCode).json(response);
  }
}
