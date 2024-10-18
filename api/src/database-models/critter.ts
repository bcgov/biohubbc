import { z } from 'zod';
/**
 * Critter Model.
 *
 * @description Data model for `critter`.
 */
export const CritterModel = z.object({
  critter_id: z.number(),
  survey_id: z.number(),
  critterbase_critter_id: z.string().uuid(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type CritterModel = z.infer<typeof CritterModel>;

/**
 * Critter Record.
 *
 * @description Data record for `critter`.
 */
export const CritterRecord = CritterModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type CritterRecord = z.infer<typeof CritterRecord>;
