import { z } from "zod";

export const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  email: z.string().email().optional(),
  country: z.string().optional(),
  bio: z.string().max(250).optional(),
  avatarUrl: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  farmTypeId: z.string().uuid().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url()
  })).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
