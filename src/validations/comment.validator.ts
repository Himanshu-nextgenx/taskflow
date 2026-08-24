import { z } from "zod";

export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty"),
});

export type CreateCommentDto = z.infer<typeof createCommentSchema>;