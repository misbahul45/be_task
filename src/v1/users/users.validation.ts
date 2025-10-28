import { z } from "zod";

export const CreateUserSchema = z.object({
  body: z
    .object({
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
      confirmPassword: z.string().min(1, "Confirm password is required"),

      emailVerified: z.date().optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Passwords do not match",
    }),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>["body"];

export const UpdateUserSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name is too long")
      .transform((s) => s.trim())
      .optional(),

    email: z
      .string()
      .email("Invalid email address")
      .transform((s) => s.toLowerCase().trim())
      .optional(),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password too long")
      .regex(
        /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter and one number"
      )
      .optional(),

    emailVerified: z.date().optional(),
  }),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>["body"];
