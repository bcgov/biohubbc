import { z } from 'zod';

/**
 * Collection Model.
 *
 * @description Data model for `Collection`.
 */
export const CollectionModel = z.object({
  collection_id: z.number(),
  name: z.string(),
  description: z.string(),
  parent_collection_id: z.number().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});

export type CollectionModel = z.infer<typeof CollectionModel>;

/**
 * Collection Record
 *
 * @description Data record for `Collection`.
 */
export const CollectionRecord = CollectionModel.omit({
  create_date: true,
  create_user: true,
  update_date: true,
  update_user: true,
  revision_count: true
});

export type CollectionRecord = z.infer<typeof CollectionRecord>;
