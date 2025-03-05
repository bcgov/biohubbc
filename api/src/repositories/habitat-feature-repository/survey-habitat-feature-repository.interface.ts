import { z } from 'zod';
import { SurveyHabitatFeatureRecord } from '../../database-models/survey_habitat_feature';
import { SurveyHabitatFeatureTaxonRecord } from '../../database-models/survey_habitat_feature_taxon';
import { GeoJSONPointZodSchema } from '../../zod-schema/geoJsonZodSchema';
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

export const SurveyHabitatFeatureGeometry = z.object({
  survey_habitat_feature_id: z.number(),
  geometry: GeoJSONPointZodSchema
});

export type SurveyHabitatFeatureGeometry = z.infer<typeof SurveyHabitatFeatureGeometry>;

export const SurveyHabitatFeaturesGeometryWithSupplementaryData = z.object({
  surveyHabitatFeaturesGeometry: z.array(SurveyHabitatFeatureGeometry),
  supplementaryData: SurveyHabitatFeatureCount
});

export type SurveyHabitatFeaturesGeometryWithSupplementaryData = z.infer<
  typeof SurveyHabitatFeaturesGeometryWithSupplementaryData
>;

export type FindSurveyHabitatFeatureAdvancedFilters = {
  /**
   * Filter results by keyword.
   *
   * @type {string}
   */
  keyword?: string;
  /**
   * Filter results by ITIS TSNs.
   *
   * @type {number[]}
   */
  habitat_feature_type_ids?: number[];
  /**
   * Filter results by ITIS TSNs.
   *
   * @type {number[]}
   */
  itis_tsns?: number[];
  /**
   * Filter results by start date.
   *
   * @type {string}
   */
  start_date?: string;
  /**
   * Filter results by end date.
   *
   * @type {string}
   */
  end_date?: string;
  /**
   * Filter results by start time.
   *
   * @type {string}
   */
  start_time?: string;
  /**
   * Filter results by end time.
   *
   * @type {string}
   */
  end_time?: string;
  /**
   * Filter results by minimum count.
   *
   * @type {number}
   */
  min_count?: number;
  /**
   * Filter results by system user id.
   *
   * Note: This is not the id of the user making the request.
   *
   * @type {number}
   */
  system_user_id?: number;
};
