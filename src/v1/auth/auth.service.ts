import { errorHandler } from "@/utils/util"
import { LoginInput, RegisterInput } from "./auth.validation"
import { UsersRepo } from "../users/users.repo"
import { AppError, AppErrorCode } from "@/utils/error"
import { ServiceResponse } from "@/types/app.type"
import { Resend } from "resend"
import env from "@/config/env"
import { VerificationType } from "@prisma/client"
import { generateVerificationTemplate } from "@/lib/email"
import { VerificationRepo } from "./verification.repo"
import crypto from 'crypto'
import * as bcrypt from 'bcrypt'
import { EmailData, VerifyEmailBody } from "@/types/auth.type"
import { SessionRepo } from "./session.repo"
import jwt from "jsonwebtoken"

export class AuthService {
  private readonly authRepo = new UsersRepo()
  private readonly verificationRepo = new VerificationRepo()
  private readonly sessionRepo = new SessionRepo()

  async register(body: RegisterInput) {
    return errorHandler<ServiceResponse>(async () => {
      const findUser = await this.authRepo.findByEmail(body.email)
      if (findUser) throw new AppError('user already exist', 400, AppErrorCode.USER_ALREADY_EXISTS)
      body.password = await bcrypt.hash(body.password, 10)
      const newUser = await this.authRepo.create(body)
      if (!newUser) throw new AppError('internal server error', 500, AppErrorCode.INTERNAL_SERVER_ERROR)

      const plainToken = crypto.randomBytes(32).toString("hex")
      const hashedToken = await bcrypt.hash(plainToken, 10)

      await this.verificationRepo.create({
        userId: newUser.id,
        token: hashedToken,
        type: VerificationType.EMAIL_VERIFICATION,
        expiredAt: new Date(Date.now() + 1000 * 60 * 60),
      })

      const verifyUrl = `${env.APP_URL}/api/${env.appVersion}/auth/verify-email?token=${plainToken}&email=${newUser.email}`

      await this.sendEmail({ name: newUser.name, email: newUser.email }, verifyUrl, VerificationType.EMAIL_VERIFICATION)

      const { password, ...data } = newUser
      return { message: "Registration successful! We've sent a verification link to your email. Please check your inbox (and spam folder) to verify your account.", data }
    })
  }

  async sendEmail(data: EmailData, url: string, subject: VerificationType) {
    const resend = new Resend(env.RESEND_API_KEY)
    return errorHandler<ServiceResponse>(async () => {
      const { error } = await resend.emails.send({
        from: "Acme <onboarding@resend.dev>",
        to: [data.email],
        subject,
        html: generateVerificationTemplate(data.name, url),
      })
      if (error) throw new AppError('failed to sending api', 400, AppErrorCode.EMAIL_SEND_FAILED, error)
      return { message: 'successfully sending email' }
    })
  }

  async generateToken({ userId, sessionId }: { userId: string; sessionId: string }) {
    return errorHandler<{ accessToken: string; refreshToken: string }>(async () => {
      const accessToken = jwt.sign({ userId }, env.accessTokenSecret, { expiresIn: "1d" })
      const refreshToken = jwt.sign({ sessionId }, env.refreshTokenSecret, { expiresIn: "30d" })
      return { accessToken, refreshToken }
    })
  }

  async login(body: LoginInput) {
    return errorHandler<ServiceResponse>(async () => {
      const findUser = await this.authRepo.findByEmail(body.email)
      if (!findUser) throw new AppError('user not found', 404, AppErrorCode.USER_NOT_FOUND)
      if (!findUser.emailVerified) throw new AppError('user unverified, please verify your email first')
      const isMatch = await bcrypt.compare(body.password, findUser.password)
      if (!isMatch) throw new AppError('invalid credentensial', 400)

      const session = await this.sessionRepo.create({ userId: findUser.id, expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) })
      const { accessToken, refreshToken } = await this.generateToken({ userId: findUser.id, sessionId: session!.id })
      await this.sessionRepo.update(session!.id, { refreshToken })

      return { message: "User successfully logged in", data: { user: findUser, accessToken, refreshToken } }
    })
  }

  async refreshToken(token: string) {
    return errorHandler(async () => {
      const session = await this.sessionRepo.getByrefreshToken(token)
      if (!session) throw new AppError('unauthorized', 400, AppErrorCode.UNAUTHORIZED)

      const newSession = await this.sessionRepo.create({ userId: session.userId, expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) })
      const { accessToken, refreshToken } = await this.generateToken({ userId: session.userId, sessionId: newSession!.id })
      await this.sessionRepo.update(newSession!.id, { refreshToken })

      return { message: 'Successfully refresh token', data: { accessToken, refreshToken } }
    })
  }

  async verifyEmail({ email, token }: VerifyEmailBody) {
    return errorHandler(async () => {
      const findToken = await this.verificationRepo.findByEmail(email)
      if (!findToken) throw new AppError('user not found', 404, AppErrorCode.NOT_FOUND)
      const isMatch = await bcrypt.compare(token, findToken.token)
      if (!isMatch) throw new AppError('token invalid', 400, AppErrorCode.INVALID_OTP)
      const isExpired = new Date() > findToken.expiredAt
      if (isExpired) throw new AppError('token expired', 400, AppErrorCode.EXPIRED_OTP)

      await this.authRepo.update(findToken.userId, { emailVerified: new Date() })
      await this.verificationRepo.deleteById(findToken.id)

      return { message: "successfully verify token", data: findToken }
    })
  }

  async resendVerificationEmail(email: string) {
    return errorHandler<ServiceResponse>(async () => {
      const user = await this.authRepo.findByEmail(email)
      if (!user) throw new AppError('User not found', 404, AppErrorCode.USER_NOT_FOUND)

      const plainToken = crypto.randomBytes(32).toString("hex")
      const hashedToken = await bcrypt.hash(plainToken, 10)

      await this.verificationRepo.create({ userId: user.id, token: hashedToken, type: VerificationType.EMAIL_VERIFICATION, expiredAt: new Date(Date.now() + 1000 * 60 * 60) })
      const verifyUrl = `${env.APP_URL}/api/${env.appVersion}/auth/verify-email?token=${plainToken}&email=${user.email}`
      await this.sendEmail({ name: user.name, email: user.email }, verifyUrl, VerificationType.EMAIL_VERIFICATION)

      return { message: "Verification email resent successfully", data: { email: user.email } }
    })
  }

  async resetPassword(email: string) {
    return errorHandler<ServiceResponse>(async () => {
      const user = await this.authRepo.findByEmail(email)
      if (!user) throw new AppError('User not found', 404, AppErrorCode.USER_NOT_FOUND)

      const plainToken = crypto.randomBytes(32).toString("hex")
      const hashedToken = await bcrypt.hash(plainToken, 10)

      await this.verificationRepo.create({ userId: user.id, token: hashedToken, type: VerificationType.PASSWORD_RESET, expiredAt: new Date(Date.now() + 1000 * 60 * 60) })
      const resetUrl = `${env.APP_URL}/api/${env.appVersion}/auth/reset-password?token=${plainToken}&email=${user.email}`
      await this.sendEmail({ name: user.name, email: user.email }, resetUrl, VerificationType.PASSWORD_RESET)

      return { message: "Password reset link sent successfully", data: { email: user.email } }
    })
  }

  async changePassword(body:{
    confirmPassword:string,
    password:string,
    email:string
  }){
    const findUser=await this.authRepo.findByEmail(body.email)

    if(!findUser){
      throw new AppError('user not found', 400, AppErrorCode.USER_NOT_FOUND)
    }

    await this.authRepo.update(findUser.id,{
      password:body.password
    })

    const { password, ...respon }=findUser

    return{
      message:'successfully updated password',
      data:respon
    }
  }
}
