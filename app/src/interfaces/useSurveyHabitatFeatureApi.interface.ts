import { Point } from 'geojson';
import { ApiPaginationResponseParams } from 'types/misc';
import { GetSamplingPeriod } from './useSamplingPeriodApi.interface';

export type HabitatFeatureQuantitativeDefinition = {
  habitat_feature_quantitative_definition_id: string;
  name: string;
  description: string | null;
  min: number | null;
  max: number | null;
  unit: number | null;
  record_end_date: string | null;
};

type HabitatFeatureQualitativeDefinitionOption = {
  habitat_feature_qualitative_definition_option_id: string;
  habitat_feature_qualitative_definition_id: string;
  name: string;
  description: string | null;
  record_end_date: string | null;
};

export type HabitatFeatureQualitativeDefinition = {
  habitat_feature_qualitative_definition_id: string;
  name: string;
  description: string | null;
  record_end_date: string | null;
  options: HabitatFeatureQualitativeDefinitionOption[];
};

export type SurveyHabitatFeatureTaxon = {
  survey_habitat_feature_taxon_id: number;
  survey_habitat_feature_id: number;
  itis_tsn: number;
  itis_scientific_name: string;
  comment: string;
};

export type CreateSurveyHabitatFeatureTaxon = {
  itis_tsn: number;
  itis_scientific_name: string;
  comment: string | null;
};

export type SurveyHabitatFeature = {
  survey_habitat_feature_id: number;
  survey_id: number;
  habitat_feature_type_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string | null;
  observed_time: string | null;
  survey_sample_site_id: number | null;
  survey_sample_site_name: string | null;
  method_technique_id: number | null;
  method_technique_name: string | null;
  survey_sample_period_id: number | null;
  survey_sample_period_start_datetime: string | null;
  survey_habitat_feature_taxons: SurveyHabitatFeatureTaxon[];
};

export type SurveyHabitatFeatureSupplementaryData = {
  count: number;
  sampling_periods: GetSamplingPeriod[];
  habitatFeatureQuantitativeDefinitions: HabitatFeatureQuantitativeDefinition[];
  habitatFeatureQualitativeDefinitions: HabitatFeatureQualitativeDefinition[];
};

export type CreateSurveyHabitatFeature = {
  habitat_feature_type_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string | null;
  observed_time: string | null;
  survey_sample_period_id: number | null;
  survey_habitat_feature_taxons: CreateSurveyHabitatFeatureTaxon[];
};

export type UpdateSurveyHabitatFeature = {
  habitat_feature_type_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string | null;
  observed_time: string | null;
  survey_sample_period_id: number | null;
  // Note: The old values will be replaced with these new values
  survey_habitat_feature_taxons: CreateSurveyHabitatFeatureTaxon[];
};

export type getSurveyHabitatFeatureWithSupplementaryData = {
  surveyHabitatFeature: SurveyHabitatFeature;
  supplementaryData: SurveyHabitatFeatureSupplementaryData;
};

export type getSurveyHabitatFeaturesWithSupplementaryData = {
  surveyHabitatFeatures: SurveyHabitatFeature[];
  supplementaryData: SurveyHabitatFeatureSupplementaryData;
  pagination: ApiPaginationResponseParams;
};

type SurveyHabitatFeatureGeometry = {
  survey_habitat_feature_id: number;
  geometry: Point;
};

export type SurveyHabitatFeaturesGeometry = {
  surveyHabitatFeaturesGeometry: SurveyHabitatFeatureGeometry[];
  count: number;
};

export type FindSurveyHabitatFeatures = {
  surveyHabitatFeatures: SurveyHabitatFeature[];
  pagination: ApiPaginationResponseParams;
};

export type FindSurveyHabitatFeaturesFilters = {
  keyword?: string;
  habitat_feature_type_ids?: number[];
  itis_tsns?: number[];
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  min_count?: string;
  system_user_id?: number;
};
