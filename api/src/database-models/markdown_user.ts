import { z } from 'zod';

/**
 * Markdown User Model.
 *
 * @description Data model for `markdown_user`.
 */
export const MarkdownUserModel = z.object({
  markdown_user_id: z.number(),
  system_user_id: z.number(),
  markdown_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type MarkdownUserModel = z.infer<typeof MarkdownUserModel>;

/**
 * Markdown User Record.
 *
 * @description Data record for `markdown_user`.
 */
export const MarkdownUserRecord = MarkdownUserModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type MarkdownUserRecord = z.infer<typeof MarkdownUserRecord>;
