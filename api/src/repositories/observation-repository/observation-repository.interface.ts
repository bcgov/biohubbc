import { z } from 'zod';
import { ObservationEnvironmentQualitativeRecord } from '../../database-models/observation_environment_qualitative';
import { ObservationEnvironmentQuantitativeRecord } from '../../database-models/observation_environment_quantitative';
import { ObservationSubcountRecord } from '../../database-models/observation_subcount';
import { SurveyObservationRecord } from '../../database-models/survey_observation';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from '../../services/critterbase-service';
import { GeoJSONPointZodSchema } from '../../zod-schema/geoJsonZodSchema';
import {
  QualitativeEnvironmentTypeDefinition,
  QuantitativeEnvironmentTypeDefinition
} from '../observation-environment-repository';
import {
  ObservationSubCountQualitativeMeasurementRecord,
  ObservationSubCountQuantitativeMeasurementRecord
} from '../observation-subcount-measurement-repository';
import { SurveySamplePeriodDetails } from '../sample-period-repository';

export type SurveyObservationWithSupplementaryData = {
  surveyObservation: ObservationRecordWithSamplingAndSubcountData;
  supplementaryObservationData: AllObservationSupplementaryData;
};

export interface InsertObservationSubCount {
  observation_subcount_id: number | null;
  comment: string | null;
  subcount: number;
  qualitative_measurements: {
    measurement_id: string;
    measurement_option_id: string;
  }[];
  quantitative_measurements: {
    measurement_id: string;
    measurement_value: number;
  }[];
}

export type InsertUpdateObservations = {
  standardColumns: InsertObservationStandardColumns | UpdateObservationStandardColumns;
  subcounts: InsertObservationSubCount[];
};

export type InsertSurveyObservation = {
  standardColumns: InsertObservationStandardColumns;
  subcounts: InsertObservationSubCount[];
};

export type UpdateSurveyObservation = {
  standardColumns: UpdateObservationStandardColumns;
  subcounts: InsertObservationSubCount[];
};

export type ObservationCountSupplementaryData = {
  observationCount: number;
};

export type ObservationMeasurementSupplementaryData = {
  qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
  quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
  qualitative_environments: QualitativeEnvironmentTypeDefinition[];
  quantitative_environments: QuantitativeEnvironmentTypeDefinition[];
};
export type ObservationSamplingSupplementaryData = {
  sampling_data: SurveySamplePeriodDetails[];
};

export type AllObservationSupplementaryData = ObservationCountSupplementaryData &
  ObservationMeasurementSupplementaryData &
  ObservationSamplingSupplementaryData;

export interface IEnvironmentDataToValidate {
  key: string;
  value: string | number;
}

export const ObservationSpecies = z.object({
  itis_tsn: z.number()
});

export type ObservationSpecies = z.infer<typeof ObservationSpecies>;

const ObservationSamplingData = z.object({
  survey_sample_site_id: z.number().nullable(),
  survey_sample_site_name: z.string().nullable(),
  method_technique_id: z.number().nullable(),
  method_technique_name: z.string().nullable(),
  // survey_sample_period_id is already included in the SurveyObservationRecord
  survey_sample_period_start_datetime: z.string().nullable()
});
type ObservationSamplingData = z.infer<typeof ObservationSamplingData>;

const ObservationSubcountQualitativeMeasurementObject = ObservationSubCountQualitativeMeasurementRecord.pick({
  critterbase_taxon_measurement_id: true,
  critterbase_measurement_qualitative_option_id: true
});

const ObservationSubcountQuantitativeMeasurementObject = ObservationSubCountQuantitativeMeasurementRecord.pick({
  critterbase_taxon_measurement_id: true,
  value: true
});

const ObservationSubcountObject = ObservationSubcountRecord.pick({
  observation_subcount_id: true,
  comment: true,
  subcount: true
}).extend({
  qualitative_measurements: z.array(ObservationSubcountQualitativeMeasurementObject),
  quantitative_measurements: z.array(ObservationSubcountQuantitativeMeasurementObject)
});

const ObservationSubcountsObject = z.object({
  subcounts: z.array(ObservationSubcountObject)
});

/**
 * An extended observation record.
 * Includes:
 * - fields from the observation record
 * - additional fields about the survey_sample_* data for the observation record
 * - additional fields about the subcount record(s) for the observation record
 */
export const ObservationRecordWithSamplingAndSubcountData = SurveyObservationRecord.extend(
  ObservationSamplingData.shape
)
  .extend({
    qualitative_environments: z.array(
      ObservationEnvironmentQualitativeRecord.pick({
        observation_environment_qualitative_id: true,
        environment_qualitative_id: true,
        environment_qualitative_option_id: true
      })
    ),
    quantitative_environments: z.array(
      ObservationEnvironmentQuantitativeRecord.pick({
        observation_environment_quantitative_id: true,
        environment_quantitative_id: true,
        value: true
      })
    )
  })
  .extend(ObservationSubcountsObject.shape);
export type ObservationRecordWithSamplingAndSubcountData = z.infer<typeof ObservationRecordWithSamplingAndSubcountData>;

/**
 * An extended flattened observation record.
 * Includes:
 * - fields from the observation record
 * - additional fields about the survey_sample_* data for the observation record
 * - additional fields about the subcount record for the observation record
 */
export const FlattenedObservationRecordWithSamplingAndSubcountData = SurveyObservationRecord.extend(
  ObservationSamplingData.shape
)
  .extend({
    qualitative_environments: z.array(
      ObservationEnvironmentQualitativeRecord.pick({
        observation_environment_qualitative_id: true,
        environment_qualitative_id: true,
        environment_qualitative_option_id: true
      })
    ),
    quantitative_environments: z.array(
      ObservationEnvironmentQuantitativeRecord.pick({
        observation_environment_quantitative_id: true,
        environment_quantitative_id: true,
        value: true
      })
    )
  })
  .extend({
    subcount: ObservationSubcountObject
  });
export type FlattenedObservationRecordWithSamplingAndSubcountData = z.infer<
  typeof FlattenedObservationRecordWithSamplingAndSubcountData
>;

export const ObservationGeometryRecord = z.object({
  survey_observation_id: z.number(),
  geometry: GeoJSONPointZodSchema
});
export type ObservationGeometryRecord = z.infer<typeof ObservationGeometryRecord>;

/**
 * Interface reflecting structure of observations that are being inserted into the database.
 */
export const InsertObservationStandardColumns = SurveyObservationRecord.pick({
  survey_id: true,
  itis_tsn: true,
  itis_scientific_name: true,
  latitude: true,
  longitude: true,
  count: true,
  observation_date: true,
  observation_time: true,
  survey_sample_period_id: true,
  observation_sign_id: true
}).extend({
  qualitative_environments: z.array(
    ObservationEnvironmentQualitativeRecord.pick({
      environment_qualitative_id: true,
      environment_qualitative_option_id: true
    })
  ),
  quantitative_environments: z.array(
    ObservationEnvironmentQuantitativeRecord.pick({
      environment_quantitative_id: true,
      value: true
    })
  )
});
export type InsertObservationStandardColumns = z.infer<typeof InsertObservationStandardColumns>;

/**
 * Interface reflecting structure of observations that are being updated in the database.
 */
export const UpdateObservationStandardColumns = SurveyObservationRecord.pick({
  survey_observation_id: true,
  survey_id: true,
  itis_tsn: true,
  itis_scientific_name: true,
  latitude: true,
  longitude: true,
  count: true,
  observation_date: true,
  observation_time: true,
  survey_sample_period_id: true,
  observation_sign_id: true
}).extend({
  qualitative_environments: z.array(
    ObservationEnvironmentQualitativeRecord.pick({
      observation_environment_qualitative_id: true,
      environment_qualitative_id: true,
      environment_qualitative_option_id: true
    })
  ),
  quantitative_environments: z.array(
    ObservationEnvironmentQuantitativeRecord.pick({
      observation_environment_quantitative_id: true,
      environment_quantitative_id: true,
      value: true
    })
  )
});
export type UpdateObservationStandardColumns = z.infer<typeof UpdateObservationStandardColumns>;

export const ObservationRecordWithSampling = SurveyObservationRecord.extend(ObservationSamplingData.shape);
export type ObservationRecordWithSampling = z.infer<typeof ObservationRecordWithSampling>;
