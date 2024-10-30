import { z } from 'zod';

export const MarkdownObject = z.object({
  markdown_id: z.number(),
  markdown_type_id: z.number(),
  data: z.string(),
  participated: z.boolean()
});

export type MarkdownObject = z.infer<typeof MarkdownObject>;

export const MarkdownUserObject = z.object({
  markdown_user_id: z.number(),
  system_user_id: z.number(),
  markdown_id: z.number()
});

export type MarkdownUserObject = z.infer<typeof MarkdownUserObject>;

export interface markdownQueryObject {
  system_user_id: number;
  markdown_type_name: string;
}
