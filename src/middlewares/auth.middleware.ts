import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError, AppErrorCode } from "@/utils/error";
import { errorHandler } from "@/utils/util";
import { UsersRepo } from "@/v1/users/users.repo";
import env from "@/config/env";

const usersRepo = new UsersRepo();

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    console.log("authMiddleware called");
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) token = req.cookies?.accessToken;
    if (!token) throw new AppError("unauthorized", 401, AppErrorCode.UNAUTHORIZED);

    const payload = jwt.verify(token, env.accessTokenSecret) as { userId: string };
    if (!payload?.userId) throw new AppError("unauthorized", 401, AppErrorCode.UNAUTHORIZED);

    const user = await usersRepo.findById(payload.userId);
    if (!user) throw new AppError("unauthorized", 401, AppErrorCode.UNAUTHORIZED);

    const { password, ...safeUser } = user;
    req.user = safeUser;

    console.log(safeUser)

    next();
  } catch (err) {
    next(err); 
  }
};

