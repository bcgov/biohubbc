import { z } from 'zod';
import { ApiPaginationResults } from '../zod-schema/pagination';

export const CollectionLink = z.object({
  collection_link_id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  url: z.string(),
  collection_id: z.number()
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
  link: CollectionLink[];
  pagination: ApiPaginationResults;
}
