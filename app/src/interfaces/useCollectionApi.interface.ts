import { ApiPaginationResponseParams } from 'types/misc';
import { ISystemUser } from './useUserApi.interface';

export interface ICollectionMembersAdvancedFilters {
  system_user_id?: number;
  keyword?: string;
  parent_collection_id?: number;
  include_children?: boolean;
}

export interface IGetCollectionsResponse {
  collections: ICollection[];
  pagination: ApiPaginationResponseParams;
}

export interface IGetCollectionHierarchyResponse {
  hierarchy: ICollection;
}

export interface ICreateCollectionRequest {
  name: string;
  description: string | null;
  members: IPostCollectionMember[];
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
  parent_collection_id: number | null;
  name: string;
  description: string | null;
  members: ICollectionMember[];
}

export interface ICollection {
  collection_id: number;
  parent_collection_id: number;
  name: string;
  description: string | null;
  subcollections: ICollection[];
  members: ICollectionMember[];
}

export interface ICreateCollectionMembersRequest {
  collection_id: number;
  members: IPostCollectionMember[];
}

export interface ICollectionMemberResponse {
  members: ICollectionMember[];
  pagination: ApiPaginationResponseParams;
}

export interface ICollectionMember extends ISystemUser {
  collection_member_id: number;
  collection_role_id: number;
  collection_role_name: string;
}

export interface IGetProjectParticipant {
  survey_member_id: number;
  system_user_id: number;
  identity_source: string;
  user_identifier: string;
  email: string | null;
  display_name: string;
  agency: string | null;
  survey_role_id: number;
  survey_role_name: string[];
  project_role_permissions: string[];
}

export interface IPostCollectionMember {
  system_user_id: number;
  collection_role_name: string;
}
