import { errorHandler } from "@/utils/util"
import { AuthService } from "./auth.service"
import { Request, Response } from "express"
import { Responder } from "@/utils/response"
import { VerifyEmailBody } from "@/types/auth.type"
import { VerificationType } from "@prisma/client"
import env from "@/config/env"

export class AuthHandler {
  private readonly authService = new AuthService()

  register = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { data, message } = await this.authService.register(req.body)
      return Responder.success(res, message, data)
    })
  }

  login = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { data: { user, accessToken, refreshToken }, message } = await this.authService.login(req.body)

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 1000,
      })

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })

      return Responder.success(res, message, { user, accessToken, refreshToken })
    })
  }

  refreshToken = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const token = req.cookies.refreshToken || req.headers.authorization?.split(" ")[1]
      const { data, message } = await this.authService.refreshToken(token!)
      res.cookie("accessToken", data.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 15 * 60 * 1000 })
      res.cookie("refreshToken", data.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", maxAge: 7 * 24 * 60 * 60 * 1000 })
      return Responder.success(res, message, data)
    })
  }

  verifyEmail = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { data, message } = await this.authService.verifyEmail(req.query as unknown as VerifyEmailBody)

      if (data.type === VerificationType.PASSWORD_RESET) {
        const url = new URL("/change-password", env.FE_URL);
        url.searchParams.set("token", req.query.token as string);
        url.searchParams.set("email", req.query.email as string);
        return res.redirect(url.toString());
      }

      return Responder.success(res, message, data)
    })
  }

  resendVerificationEmail = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { data, message } = await this.authService.resendVerificationEmail(req.body.email)
      return Responder.success(res, message, data)
    })
  }

  resetPassword = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { data, message } = await this.authService.resetPassword(req.body.email)
      return Responder.success(res, message, data)
    })
  }

  changePassword = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const { email }=req.query
      const { data, message }=await this.authService.changePassword({email, ...req.body})
      return Responder.success(res,message, data)
    })
  }

  me = async (req: Request, res: Response) => {
    return errorHandler(async () => {
      const user=req.user
      return Responder.success(res, "successfully get user", user)
    })
  }
}
