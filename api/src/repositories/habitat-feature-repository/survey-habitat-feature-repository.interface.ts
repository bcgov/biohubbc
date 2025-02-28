import { z } from 'zod';
import { SurveyHabitatFeatureRecord } from '../../database-models/survey_habitat_feature';
import { SurveyHabitatFeatureTaxonRecord } from '../../database-models/survey_habitat_feature_taxon';
import { FindHabitatFeatureDefinitions } from './habitat-feature-repository.interface';

export type InsertSurveyHabitatFeature = Pick<
  SurveyHabitatFeatureRecord,
  'habitat_feature_type_id' | 'count' | 'latitude' | 'longitude' | 'observed_date' | 'observed_time'
>;

export type UpdateSurveyHabitatFeature = Pick<
  SurveyHabitatFeatureRecord,
  'habitat_feature_type_id' | 'count' | 'latitude' | 'longitude' | 'observed_date' | 'observed_time'
>;

export const SurveyHabitatFeatureCount = z.object({
  count: z.number()
});
export type SurveyHabitatFeatureCount = z.infer<typeof SurveyHabitatFeatureCount>;

export type SurveyHabitatFeaturesSupplementaryData = SurveyHabitatFeatureCount & FindHabitatFeatureDefinitions;

export type SurveyHabitatFeaturesWithSupplementaryData = {
  surveyHabitatFeatures: SurveyHabitatFeatureWithTaxons[];
  supplementaryData: SurveyHabitatFeaturesSupplementaryData;
};

export const SurveyHabitatFeatureWithTaxons = SurveyHabitatFeatureRecord.extend({
  survey_habitat_feature_taxons: z.array(SurveyHabitatFeatureTaxonRecord)
});
export type SurveyHabitatFeatureWithTaxons = z.infer<typeof SurveyHabitatFeatureWithTaxons>;
