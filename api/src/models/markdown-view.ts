import { z } from 'zod';

export const MarkdownObject = z.object({
  markdown_id: z.number(),
  markdown_type_id: z.number(),
  data: z.string(),
  participated: z.boolean()
});

export type MarkdownObject = z.infer<typeof MarkdownObject>;

export interface markdownQueryObject {
  system_user_id: number;
  markdown_type_name: string;
}
