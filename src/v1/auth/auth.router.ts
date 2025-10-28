import { Validation } from "@/middlewares/validation.middleware"
import { Router } from "express"
import { RegisterSchema, LoginSchema, ForgotPasswordSchema } from "./auth.validation"
import { AuthHandler } from "./auth.handler"
import { authMiddleware } from "@/middlewares/auth.middleware"

const router = Router()
const handler = new AuthHandler()

router.post("/register", Validation(RegisterSchema), handler.register)
router.post("/login", Validation(LoginSchema), handler.login)
router.get("/verify-email", handler.verifyEmail)
router.post("/resend-verification-email", handler.resendVerificationEmail)
router.post("/reset-password", Validation(ForgotPasswordSchema), handler.resetPassword)
router.post("/change-password", handler.changePassword)
router.get("/me", authMiddleware, handler.me)
router.post("/refresh-token", handler.refreshToken)

export default router
