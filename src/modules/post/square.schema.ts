import { z } from "zod";

export const createSquareSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
});

export type CreateSquareInput = z.infer<typeof createSquareSchema>;

export const squareMessageSchema = z.object({
  content: z.string().min(1).max(500),
});

export type SquareMessageInput = z.infer<typeof squareMessageSchema>;
