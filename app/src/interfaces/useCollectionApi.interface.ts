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
  participants: ICollectionParticipant[];
}

export interface ICollection {
  collection_id: number;
  name: string;
  description: string | null;
  participants: ICollectionParticipant[];
}

export interface ICollectionParticipant {
  collection_participation_id: number;
  system_user_id: number;
  collection_role_id: number;
  collection_role_name: string;
  identity_source: string;
  user_identifier: string;
  email: string | null;
  display_name: string;
  agency: string | null;
}

export interface IGetProjectParticipant {
  project_participation_id: number;
  project_id: number;
  system_user_id: number;
  identity_source: string;
  user_identifier: string;
  email: string | null;
  display_name: string;
  agency: string | null;
  project_role_ids: number[];
  project_role_names: string[];
  project_role_permissions: string[];
}

export interface IPostCollectionParticipant {
  system_user_id: number;
  collection_role_name: string;
}
