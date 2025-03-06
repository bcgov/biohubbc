import { z } from 'zod';

/**
 * Markdown Type Model.
 *
 * @description Data model for `markdown_type`.
 */
export const MarkdownTypeModel = z.object({
  markdown_type_id: z.number(),
  name: z.string(),
  description: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MarkdownTypeModel = z.infer<typeof MarkdownTypeModel>;

/**
 * Markdown Type Record.
 *
 * @description Data record for `markdown_type`.
 */
export const MarkdownTypeRecord = MarkdownTypeModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MarkdownTypeRecord = z.infer<typeof MarkdownTypeRecord>;
