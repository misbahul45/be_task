import { z } from "zod";

export const RegisterSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .transform((s) => s.trim()),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .transform((s) => s.toLowerCase().trim()),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long"),
    confirmPassword: z.string().min(1, "confirmPassword is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  }),
});

export type RegisterInput = z.infer<typeof RegisterSchema>["body"];

export const ForgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .transform((s) => s.toLowerCase().trim()),
  }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>["body"];


export const LoginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, "Email is required")
      .email("Invalid email address")
      .transform((s) => s.toLowerCase().trim()),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long"),
  }),
});

export type LoginInput = z.infer<typeof LoginSchema>["body"];


export const ChangePasswordSchema = z.object({
  body: z
    .object({
      password: z
        .string()
        .min(8, "Current password must be at least 8 characters")
        .max(128, "Password too long"),

      newPassword: z
        .string()
        .min(8, "New password must be at least 8 characters")
        .max(128, "New password too long"),
    })
    .refine((data) => data.password !== data.newPassword, {
      path: ["newPassword"],
      message: "New password must be different from current password",
    }),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>["body"];
