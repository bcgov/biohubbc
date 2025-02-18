import { z } from 'zod';

/**
 * System User Model.
 *
 * @description Data model for `system_user`.
 */
export const SystemUserModel = z.object({
  system_user_id: z.number(),
  user_identity_source_id: z.number(),
  user_identifier: z.string(),
  user_guid: z.string().nullable(),
  record_effective_date: z.string(),
  record_end_date: z.string().nullable(),
  email: z.string(),
  display_name: z.string(),
  given_name: z.string().nullable(),
  family_name: z.string().nullable(),
  agency: z.string().nullable(),
  notes: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SystemUserModel = z.infer<typeof SystemUserModel>;

/**
 * System User Record
 *
 * @description Data record for `system_user`.
 */
export const SystemUserRecord = SystemUserModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SystemUserRecord = z.infer<typeof SystemUserRecord>;
