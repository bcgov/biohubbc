import { z } from 'zod';

/**
 * Markdown Model.
 *
 * @description Data model for `markdown`.
 */
export const MarkdownModel = z.object({
  markdown_id: z.number(),
  markdown_type_id: z.number(),
  data: z.string().nullable(),
  score: z.number(),
  record_end_date: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MarkdownModel = z.infer<typeof MarkdownModel>;

/**
 * Markdown Record.
 *
 * @description Data record for `markdown`.
 */
export const MarkdownRecord = MarkdownModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MarkdownRecord = z.infer<typeof MarkdownRecord>;
