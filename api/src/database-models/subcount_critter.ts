import { z } from 'zod';

/**
 * Subcount Critter Model.
 *
 * @description Data model for `subcount_critter`.
 */
export const SubcountCritterModel = z.object({
  subcount_critter_id: z.number(),
  observation_subcount_id: z.number(),
  critter_id: z.number(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type SubcountCritterModel = z.infer<typeof SubcountCritterModel>;

/**
 * Subcount Critter Record.
 *
 * @description Data record for `subcount_critter`.
 */
export const SubcountCritterRecord = SubcountCritterModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type SubcountCritterRecord = z.infer<typeof SubcountCritterRecord>;
