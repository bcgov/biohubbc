import { ApiPaginationResponseParams } from 'types/misc';

export interface IGetCollectionsResponse {
  collections: ICollection[];
  pagination: ApiPaginationResponseParams;
}

export interface ICreateCollectionRequest {
  name: string;
  description: string;
  participants: IPostCollectionParticipant[];
}

export interface IUpdateCollectionRequest {
  name: string;
  description: string;
  participants: IPostCollectionParticipant[];
}

export interface ICollection {
  collection_id: number;
  name: string;
  description: string | null;
}

export interface ICollectionParticipant {
  collection_participation_id: number;
  collection_id: number;
  system_user_id: number;
  identity_source: string;
  user_identifier: string;
  email: string | null;
  display_name: string;
  agency: string | null;
  collection_role_ids: number[];
  collection_role_names: string[];
  collection_role_permissions: string[];
}

export interface IPostCollectionParticipant {
  system_user_id: number;
}
