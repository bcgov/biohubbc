import { ApiPaginationResponseParams } from 'types/misc';

export interface IGetCollectionsResponse {
  collections: ICollection[];
  pagination: ApiPaginationResponseParams;
}

export interface ICreateCollectionRequest {
  collection_type_id: number;
  name: string;
  message: string;
  data: object | null;
  record_end_date: string | null;
}

export interface IUpdateCollectionRequest extends ICreateCollectionRequest {
  collection_id: number;
}

export interface ICollection {
  collection_id: number;
  name: string;
  description: string | null;
}
