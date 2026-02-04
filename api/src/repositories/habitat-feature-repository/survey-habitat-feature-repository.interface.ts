import { z } from 'zod';
import { MethodTechniqueRecord } from '../../database-models/method_technique';
import { SurveyHabitatFeatureRecord } from '../../database-models/survey_habitat_feature';
import { SurveyHabitatFeatureTaxonRecord } from '../../database-models/survey_habitat_feature_taxon';
import { SurveySampleSiteRecord } from '../../database-models/survey_sample_site';
import { GeoJSONPointZodSchema } from '../../zod-schema/geoJsonZodSchema';
import { SurveySamplePeriodDetails } from '../sample-period-repository';
import { FindHabitatFeatureDefinitions } from './habitat-feature-repository.interface';

export type InsertSurveyHabitatFeatureTaxon = Pick<
  SurveyHabitatFeatureTaxonRecord,
  'itis_tsn' | 'itis_scientific_name' | 'comment'
>;

export type InsertSurveyHabitatFeature = Pick<
  SurveyHabitatFeatureRecord,
  | 'habitat_feature_type_id'
  | 'count'
  | 'latitude'
  | 'longitude'
  | 'observed_date'
  | 'observed_time'
  | 'survey_sample_period_id'
> & {
  survey_habitat_feature_taxons: InsertSurveyHabitatFeatureTaxon[];
};

export type UpdateSurveyHabitatFeature = Pick<
  SurveyHabitatFeatureRecord,
  | 'habitat_feature_type_id'
  | 'count'
  | 'latitude'
  | 'longitude'
  | 'observed_date'
  | 'observed_time'
  | 'survey_sample_period_id'
> & {
  survey_habitat_feature_taxons: InsertSurveyHabitatFeatureTaxon[];
};

export const SurveyHabitatFeatureCount = z.object({
  count: z.number()
});
export type SurveyHabitatFeatureCount = z.infer<typeof SurveyHabitatFeatureCount>;

export type SurveyHabitatFeaturesSupplementaryData = SurveyHabitatFeatureCount &
  FindHabitatFeatureDefinitions & {
    sampling_periods: SurveySamplePeriodDetails[];
  };

/**
 * An array of survey habitat features with supplementary data.
 */
export type SurveyHabitatFeaturesWithSupplementaryData = {
  surveyHabitatFeatures: SurveyHabitatFeatureWithTaxonsAndSampling[];
  supplementaryData: SurveyHabitatFeaturesSupplementaryData;
};

/**
 * A survey habitat feature with supplementary data.
 */
export type SurveyHabitatFeatureWithSupplementaryData = {
  surveyHabitatFeature: SurveyHabitatFeatureWithTaxonsAndSampling;
  supplementaryData: SurveyHabitatFeaturesSupplementaryData;
};

export const SurveyHabitatFeatureSamplingData = z.object({
  survey_sample_site_id: SurveySampleSiteRecord.shape.survey_sample_site_id.nullable(),
  survey_sample_site_name: SurveySampleSiteRecord.shape.name.nullable(),
  method_technique_id: MethodTechniqueRecord.shape.method_technique_id.nullable(),
  method_technique_name: MethodTechniqueRecord.shape.name.nullable(),
  // survey_sample_period_id is already included in the SurveyHabitatFeatureRecord
  survey_sample_period_start_datetime: z.string().nullable()
});
export type SurveyHabitatFeatureSamplingData = z.infer<typeof SurveyHabitatFeatureSamplingData>;

export const SurveyHabitatFeatureWithTaxonsAndSampling = SurveyHabitatFeatureRecord.pick({
  survey_habitat_feature_id: true,
  survey_id: true,
  habitat_feature_type_id: true,
  count: true,
  latitude: true,
  longitude: true,
  observed_date: true,
  observed_time: true,
  survey_sample_period_id: true
})
  .extend({
    survey_habitat_feature_taxons: z.array(SurveyHabitatFeatureTaxonRecord)
  })
  .merge(SurveyHabitatFeatureSamplingData);
export type SurveyHabitatFeatureWithTaxonsAndSampling = z.infer<typeof SurveyHabitatFeatureWithTaxonsAndSampling>;

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
