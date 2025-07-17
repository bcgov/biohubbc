import { z } from 'zod';
import { ApiPaginationResults } from '../zod-schema/pagination';

export const CollectionLink = z.object({
  collection_links_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  collection_id: z.number(),
  record_end_date: z.string().nullable().optional(),
  create_date: z.string(),
  create_user: z.number()
});
export type CollectionLink = z.infer<typeof CollectionLink>;

export interface IPostCollectionLinkRequest {
  name: string;
  description?: string;
  url: string;
}

export interface IPutCollectionLinkRequest {
  name: string;
  description?: string;
  url: string;
}

export interface IEndCollectionLinkRequest {
  record_end_date: string;
}

export interface IGetCollectionLinksResponse {
  links: CollectionLink[];
  pagination: ApiPaginationResults;
}
