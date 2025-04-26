import { z } from 'zod';
import { COLLECTION_ROLE } from '../constants/roles';

export interface ICollectionAdvancedFilters {
  keyword?: string;
  system_user_id?: number;
  itis_tsns?: number[];
}

export interface ICollectionParticipantsAdvancedFilters {
  keyword?: string;
  system_user_id?: number;
}

export const CollectionParticipant = z.object({
  collection_participation_id: z.number(),
  collection_id: z.number(),
  system_user_id: z.number(),
  collection_role_id: z.number(),
  collection_role_name: z.string()
});

export type CollectionParticipant = z.infer<typeof CollectionParticipant>;

export interface IPostCollectionParticipant {
  system_user_id: number;
  collection_role_name: COLLECTION_ROLE;
}

export const Collection = z.object({
  collection_id: z.number(),
  name: z.string(),
  description: z.string(),
  participants: z.array(CollectionParticipant.omit({ collection_id: true }))
});

export type Collection = z.infer<typeof Collection>;

export const CollectionBasic = Collection.pick({
  collection_id: true,
  name: true
});

export type CollectionBasic = z.infer<typeof CollectionBasic>;

export interface IPostCollectionRequest {
  name: string;
  description: string;
  participants: IPostCollectionParticipant[];
}

export interface IPostCollection {
  name: string;
  description: string;
}

export interface IPostCollectionSurvey {
  survey_id: number;
  collection_id: number;
}

export interface ICreateCollectionSurveyRequest {
  survey_id: number;
  collections: { collection_id: number }[];
}

export interface IAddMultipleSurveysToCollection {
  collection_id: number;
  surveys: { survey_id: number }[];
}

export interface IDeleteCollectionSurveyRequest {
  survey_id: number;
  collections: { collection_id: number }[];
}
