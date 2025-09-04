import * as z from "zod";

export const profileFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(30)
    .optional()
    .nullable(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(30)
    .optional()
    .nullable(),
  avatarUrl: z
    .custom<FileList>()
    .optional()
    .nullable()
    .refine(
      (files) =>
        !files || files.length === 0 || files[0].size <= 2 * 1024 * 1024,
      "Image must be less than 2MB"
    ),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
