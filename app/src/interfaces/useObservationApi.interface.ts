import { StandardObservationColumns, SupplementaryObservationData } from 'contexts/observationsTableContext';
import { ApiPaginationResponseParams } from 'types/misc';
export interface IGetSurveyObservationsResponse {
  surveyObservations: ObservationRecordWithSamplingAndSubcountData[];
  supplementaryObservationData: SupplementaryObservationData;
  pagination: ApiPaginationResponseParams;
}

export interface IGetSurveyObservationsGeometryResponse {
  surveyObservationsGeometry: {
    survey_observation_id: number;
    geometry: GeoJSON.Point;
  }[];
  supplementaryObservationData: SupplementaryObservationData;
}

type ObservationSamplingData = {
  survey_sample_site_name: string | null;
  survey_sample_method_name: string | null;
  survey_sample_period_start_datetime: string | null;
};

type ObservationSubCountQualitativeMeasurementRecord = {
  observation_subcount_id: number;
  critterbase_taxon_measurement_id: string;
  critterbase_measurement_qualitative_option_id: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

type ObservationSubCountQuantitativeMeasurementRecord = {
  observation_subcount_id: number;
  critterbase_taxon_measurement_id: string;
  value: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

type ObservationSubcountQualitativeMeasurementObject = Pick<
  ObservationSubCountQualitativeMeasurementRecord,
  'critterbase_taxon_measurement_id' | 'critterbase_measurement_qualitative_option_id'
>;

type ObservationSubcountQuantitativeMeasurementObject = Pick<
  ObservationSubCountQuantitativeMeasurementRecord,
  'critterbase_taxon_measurement_id' | 'value'
>;

type ObservationSubcountRecord = {
  observation_subcount_id: number;
  survey_observation_id: number;
  subcount: number | null;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

type ObservationSubcountObject = {
  observation_subcount_id: ObservationSubcountRecord['observation_subcount_id'];
  subcount: ObservationSubcountRecord['subcount'];
  qualitative_measurements: ObservationSubcountQualitativeMeasurementObject[];
  quantitative_measurements: ObservationSubcountQuantitativeMeasurementObject[];
};

type ObservationSubcountsObject = {
  subcounts: ObservationSubcountObject[];
};

type ObservationRecordWithSamplingAndSubcountData = StandardObservationColumns &
  ObservationSamplingData &
  ObservationSubcountsObject;

/**
 * A quantitative environment.
 */
export type EnvironmentQuantitative = {
  environment_id: number;
  observation_subcount_quantitative_environment_id: number;
  observation_subcount_id: number;
  environment_quantitative_id: number;
  value: number;
};

/**
 * A qualitative environment value.
 */
export type EnvironmentQualitative = {
  environment_id: number;
  observation_subcount_qualitative_environment_id: number;
  observation_subcount_id: number;
  environment_qualitative_environment_qualitative_option_id: number;
};

/**
 * Any environment value.
 */
export type EnvironmentValue = EnvironmentQuantitative | EnvironmentQualitative;

/**
 * A qualitative environment unit.
 */
export type EnvironmentUnit = 'millimeter' | 'centimeter' | 'meter' | 'milligram' | 'gram' | 'kilogram';

/**
 * A quantitative environment type definition.
 */
export type EnvironmentQuantitativeTypeDefinition = {
  environment_id: number;
  environment_quantitative_id: number;
  name: string;
  description: string | null;
  min: number | null;
  max: number | null;
  unit: EnvironmentUnit | null;
};

/**
 * A qualitative environment option definition (ie. drop-down option).
 */
export type EnvironmentQualitativeOption = {
  environment_qualitative_option_id: string;
  name: string;
  description: string | null;
};

/**
 * A qualitative environment type definition.
 */
export type EnvironmentQualitativeTypeDefinition = {
  environment_id: number;
  environment_qualitative_id: number | null;
  name: string;
  description: string | null;
  options: EnvironmentQualitativeOption[];
};

/**
 * Any environment type definition.
 */
export type EnvironmentType = EnvironmentQuantitativeTypeDefinition | EnvironmentQualitativeTypeDefinition;
