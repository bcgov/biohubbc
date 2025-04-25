import { z } from 'zod';

export interface ICollectionAdvancedFilters {
  /**
   * Filter results by keyword.
   *
   * @type {string}
   * @memberof ICollectionAdvancedFilters
   */
  keyword?: string;

  /**
   * Filter results by system user id.
   *
   * Note: This is not the id of the user making the request.
   *
   * @type {number}
   * @memberof ICollectionAdvancedFilters
   */
  system_user_id?: number;
}

export const CollectionData = z.object({
  collection_id: z.number(),
  name: z.string(),
  objectives: z.string().nullable(),
  create_date: z.string().nullable(),
  update_date: z.string().nullable()
});

export type CollectionData = z.infer<typeof CollectionData>;

export const FindCollectionsResponse = z.object({
  collection_id: z.number(),
  name: z.string(),
  objectives: z.string().nullable(),
  members: z.array(z.object({ system_user_id: z.number(), display_name: z.string() }))
});

export type FindCollectionsResponse = z.infer<typeof FindCollectionsResponse>;