import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition
} from 'interfaces/useReferenceApi.interface';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { ApiPaginationResponseParams } from 'types/misc';
export interface IGetSurveyObservationsResponse {
  surveyObservations: ObservationRecordWithSamplingAndSubcountData[];
  supplementaryObservationData: SupplementaryObservationData;
  pagination: ApiPaginationResponseParams;
}

export type FormikKeyUuid = { _id?: string };

export interface IGetSurveyObservationsGeometryObject {
  survey_observation_id: number;
  geometry: GeoJSON.Point;
}

export interface IGetSurveyObservationsGeometryResponse {
  surveyObservationsGeometry: IGetSurveyObservationsGeometryObject[];
  supplementaryObservationData: SupplementaryObservationCountData;
}

type ObservationSamplingData = {
  survey_sample_site_name: string | null;
  method_technique_name: string | null;
  survey_sample_period_start_datetime: string | null;
};

export type StandardObservationColumns = {
  survey_observation_id: number;
  itis_tsn: number | null;
  itis_scientific_name: string | null;
  survey_sample_period_id: number | null;
  count: number | null;
  observation_date: string | null;
  observation_time: string | null;
  latitude: number | null;
  longitude: number | null;
};

export type SubcountObservationColumns = {
  observation_subcount_id: number | null;
  observation_subcount_sign_id: number;
  comment: string | null;
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

export type ObservationSamplingSupplementaryData = {
  sampling_data: GetSamplingPeriod[];
};

export type SupplementaryObservationMeasurementData = {
  qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
  quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
  qualitative_environments: EnvironmentQualitativeTypeDefinition[];
  quantitative_environments: EnvironmentQuantitativeTypeDefinition[];
};

export type SupplementaryObservationData = SupplementaryObservationCountData &
  SupplementaryObservationMeasurementData &
  ObservationSamplingSupplementaryData;

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

export type ObservationSubcountQualitativeMeasurementObject = Pick<
  ObservationSubCountQualitativeMeasurementRecord,
  'critterbase_taxon_measurement_id' | 'critterbase_measurement_qualitative_option_id'
> &
  FormikKeyUuid;

export type ObservationSubcountQuantitativeMeasurementObject = Pick<
  ObservationSubCountQuantitativeMeasurementRecord,
  'critterbase_taxon_measurement_id' | 'value'
> &
  FormikKeyUuid;

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

export type ObservationSubcountQualitativeEnvironmentObject = Pick<
  ObservationSubCountQualitativeEnvironmentRecord,
  'observation_subcount_qualitative_environment_id' | 'environment_qualitative_id' | 'environment_qualitative_option_id'
> &
  FormikKeyUuid;

export type ObservationSubcountQuantitativeEnvironmentObject = Pick<
  ObservationSubCountQuantitativeEnvironmentRecord,
  'observation_subcount_quantitative_environment_id' | 'environment_quantitative_id' | 'value'
> &
  FormikKeyUuid;

type ObservationSubcountRecord = {
  observation_subcount_id: number;
  survey_observation_id: number;
  observation_subcount_sign_id: number;
  comment: string;
  subcount: number | null;
  create_date: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
};

type ObservationSubcountObject = {
  observation_subcount_id: ObservationSubcountRecord['observation_subcount_id'];
  observation_subcount_sign_id: ObservationSubcountRecord['observation_subcount_sign_id'];
  comment: ObservationSubcountRecord['comment'];
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

export interface SubcountQualitativeMeasurement {
  measurement_id: string;
  measurement_option_id: string;
}

export interface SubcountQuantitativeMeasurement {
  measurement_id: string;
  measurement_value: number;
}

export interface SubcountQualitativeEnvironment {
  environment_qualitative_id: string;
  environment_qualitative_option_id: string;
}

export interface SubcountQuantitativeEnvironment {
  environment_quantitative_id: string;
  value: number;
}

export interface SubcountToSave {
  observation_subcount_id: number | null;
  subcount: number | null;
  comment: string | null;
  qualitative_measurements: SubcountQualitativeMeasurement[];
  quantitative_measurements: SubcountQuantitativeMeasurement[];
  qualitative_environments: SubcountQualitativeEnvironment[];
  quantitative_environments: SubcountQuantitativeEnvironment[];
}

export interface IObservationTableRowToSave {
  standardColumns: StandardObservationColumns;
  subcounts: SubcountToSave[];
}

export interface ICreateObservationRequest {
  standardColumns: {
    itis_tsn: number | null;
    itis_scientific_name: string | null;
    survey_sample_period_id: number | null;
    count: number | null;
    observation_date: string | null;
    observation_time: string | null;
    latitude: number | null;
    longitude: number | null;
    qualitative_environments: SubcountQualitativeEnvironment[];
    quantitative_environments: SubcountQuantitativeEnvironment[];
  };
  subcounts: {
    count: number | null;
    observation_subcount_sign_id: number | null;
    qualitative_measurements: SubcountQualitativeMeasurement[];
    quantitative_measurements: SubcountQuantitativeMeasurement[];
    comment: string | null;
  }[];
}
