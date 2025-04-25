import { ApiPaginationResponseParams } from 'types/misc';

export interface ICollectionParticipantsAdvancedFilters {
  system_user_id?: number;
  keyword?: string;
}
export interface IGetCollectionsResponse {
  collections: ICollection[];
  pagination: ApiPaginationResponseParams;
}

export interface ICreateCollectionRequest {
  name: string;
  description: string | null;
  participants: IPostCollectionParticipant[];
}

export interface ICreateCollectionSurveyRequest {
  survey_id: number;
  collections: { collection_id: number }[];
}

export interface ICreateSurveyCollectionRequest {
  collection_id: number;
  surveys: { survey_id: number }[];
}

export interface IUpdateCollectionRequest {
  collection_id: number;
  name: string;
  description: string | null;
  participants: ICollectionParticipant[];
}

export interface ICollection {
  collection_id: number;
  name: string;
  description: string | null;
  participants: ICollectionParticipant[];
}

export interface ICreateCollectionParticipantsRequest {
  collection_id: number;
  participants: IPostCollectionParticipant[];
}

export interface ICollectionParticipantResponse {
  participants: ICollectionParticipant[];
  pagination: ApiPaginationResponseParams;
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
