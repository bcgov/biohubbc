import { z } from 'zod';

export interface ICollectionAdvancedFilters {
  keyword?: string;
  system_user_id?: number;
  itis_tsns?: number[];
}

export const Collection = z.object({
  collection_id: z.number(),
  name: z.string(),
  description: z.string(),
  participants: z.array(z.object({ system_user_id: z.number() }))
});

export type Collection = z.infer<typeof Collection>;

export interface IPostCollection {
  name: string;
  description: string;
}
