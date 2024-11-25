import { z } from 'zod';
import { MarkdownRecord } from '../database-models/markdown';

export const MarkdownObject = MarkdownRecord.pick({
  markdown_id: true,
  markdown_type_id: true,
  data: true
}).extend({
  participated: z.boolean()
});

export type MarkdownObject = z.infer<typeof MarkdownObject>;

export interface MarkdownQueryObject {
  system_user_id: number;
  markdown_type_name: string;
}
