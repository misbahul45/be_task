import { z } from "zod";
import { MoodLabel } from "@prisma/client";

export const CreateMoodSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  moodScore: z
    .number()
    .int()
    .min(0, { message: "moodScore must be at least 0" })
    .max(10, { message: "moodScore cannot exceed 10" }),
  moodLabel: z.enum(Object.values(MoodLabel) as [string, ...string[]]),
  notes: z.string().optional(),
});

export const UpdateMoodSchema = z.object({
  date: z
    .string()
    .optional()
    .refine((val) => (val ? !isNaN(Date.parse(val)) : true), {
      message: "Invalid date format",
    }),
  moodScore: z
    .number()
    .int()
    .min(0, { message: "moodScore must be at least 0" })
    .max(5, { message: "moodScore cannot exceed 5" })
    .optional(),
  moodLabel: z.enum(Object.values(MoodLabel) as [string, ...string[]]).optional(),
  notes: z.string().optional(),
});

export type CreateMoodInput = z.infer<typeof CreateMoodSchema>;
export type UpdateMoodInput = z.infer<typeof UpdateMoodSchema>;
