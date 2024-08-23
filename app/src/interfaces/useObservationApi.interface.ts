import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition
} from 'interfaces/useReferenceApi.interface';
import { ApiPaginationResponseParams } from 'types/misc';
export interface IGetSurveyObservationsResponse {
  surveyObservations: ObservationRecordWithSamplingAndSubcountData[];
  supplementaryObservationData: SupplementaryObservationData;
  pagination: ApiPaginationResponseParams;
}

export interface IGetSurveyObservationsGeometryObject {
  survey_observation_id: number;
  geometry: GeoJSON.Point;
}

export interface IGetSurveyObservationsGeometryResponse {
  surveyObservationsGeometry: IGetSurveyObservationsGeometryObject[];
  supplementaryObservationData: SupplementaryObservationData;
}

type ObservationSamplingData = {
  survey_sample_site_name: string | null;
  survey_sample_method_name: string | null;
  survey_sample_period_start_datetime: string | null;
};

export type StandardObservationColumns = {
  survey_observation_id: number;
  itis_tsn: number | null;
  itis_scientific_name: string | null;
  survey_sample_site_id: number | null;
  survey_sample_method_id: number | null;
  survey_sample_period_id: number | null;
  count: number | null;
  observation_date: string;
  observation_time: string;
  latitude: number | null;
  longitude: number | null;
};

export type SubcountObservationColumns = {
  observation_subcount_id: number | null;
  observation_subcount_sign_id: number;
  subcount: number | null;
  qualitative_measurements: {
    field: string;
    critterbase_taxon_measurement_id: string;
    critterbase_measurement_qualitative_option_id: string;
  }[];
  quantitative_measurements: {
    critterbase_taxon_measurement_id: string;
    value: number;
  }[];
  [key: string]: any;
};

export type ObservationRecord = StandardObservationColumns & SubcountObservationColumns;

export type SupplementaryObservationCountData = {
  observationCount: number;
};

export type SupplementaryObservationMeasurementData = {
  qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
  quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
  qualitative_environments: EnvironmentQualitativeTypeDefinition[];
  quantitative_environments: EnvironmentQuantitativeTypeDefinition[];
};

export type SupplementaryObservationData = SupplementaryObservationCountData & SupplementaryObservationMeasurementData;

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

type ObservationSubCountQualitativeEnvironmentRecord = {
  observation_subcount_qualitative_environment_id: number;
  observation_subcount_id: number;
  environment_qualitative_id: string;
  environment_qualitative_option_id: string;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

type ObservationSubCountQuantitativeEnvironmentRecord = {
  observation_subcount_quantitative_environment_id: number;
  observation_subcount_id: number;
  environment_quantitative_id: string;
  value: number;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

type ObservationSubcountQualitativeEnvironmentObject = Pick<
  ObservationSubCountQualitativeEnvironmentRecord,
  'environment_qualitative_id' | 'environment_qualitative_option_id'
>;

type ObservationSubcountQuantitativeEnvironmentObject = Pick<
  ObservationSubCountQuantitativeEnvironmentRecord,
  'observation_subcount_quantitative_environment_id' | 'environment_quantitative_id' | 'value'
>;

type ObservationSubcountRecord = {
  observation_subcount_id: number;
  survey_observation_id: number;
  observation_subcount_sign_id: number;
  subcount: number | null;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

type ObservationSubcountObject = {
  observation_subcount_id: ObservationSubcountRecord['observation_subcount_id'];
  observation_subcount_sign_id: ObservationSubcountRecord['observation_subcount_sign_id']
  subcount: ObservationSubcountRecord['subcount'];
  qualitative_measurements: ObservationSubcountQualitativeMeasurementObject[];
  quantitative_measurements: ObservationSubcountQuantitativeMeasurementObject[];
  qualitative_environments: ObservationSubcountQualitativeEnvironmentObject[];
  quantitative_environments: ObservationSubcountQuantitativeEnvironmentObject[];
};

type ObservationSubcountsObject = {
  subcounts: ObservationSubcountObject[];
};

type ObservationRecordWithSamplingAndSubcountData = StandardObservationColumns &
  ObservationSamplingData &
  ObservationSubcountsObject;
