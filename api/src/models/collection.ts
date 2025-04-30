import { z } from 'zod';
import { COLLECTION_ROLE } from '../constants/roles';

export interface ICollectionAdvancedFilters {
  keyword?: string;
  system_user_id?: number;
  itis_tsns?: number[];
  parent_collection_id?: number | null;
}

export interface ICollectionParticipantsAdvancedFilters {
  keyword?: string;
  system_user_id?: number;
}

export const CollectionParticipant = z.object({
  collection_member_id: z.number(),
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

export const Collection: z.ZodType<any> = z.lazy(() =>
  z.object({
    collection_id: z.number(),
    name: z.string(),
    description: z.string(),
    parent_collection_id: z.number().nullable(),
    participants: z.array(CollectionParticipant.omit({ collection_id: true })),
    subcollections: z.array(Collection)
  })
);

export type Collection = z.infer<typeof Collection>;

export interface IPostCollectionRequest {
  name: string;
  description: string;
  parent_collection_id: number | null;
  participants: IPostCollectionParticipant[];
}

export interface IPostCollection {
  name: string;
  description: string;
  parent_collection_id: number | null;
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
