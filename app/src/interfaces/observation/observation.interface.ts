import {
  ObservationEnvironmentData,
  ObservationEnvironmentQualitativeObject,
  ObservationEnvironmentQuantitativeObject
} from 'interfaces/observation/environment.interface';
import {
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition
} from 'interfaces/useCritterApi.interface';
import {
  ObservationSubcountObject,
  SubcountObservationColumns,
  SubcountQualitativeMeasurement,
  SubcountQuantitativeMeasurement
} from 'interfaces/useObservationApi.interface';
import {
  EnvironmentQualitativeTypeDefinition,
  EnvironmentQuantitativeTypeDefinition
} from 'interfaces/useReferenceApi.interface';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';
import { ApiPaginationResponseParams } from 'types/misc';

export type SurveyObservationBasic = {
  survey_observation_id: number;
  survey_id: number;
  itis_tsn: number | null;
  itis_scientific_name: string | null;
  survey_sample_period_id: number | null;
  count: number | null;
  latitude: number | null;
  longitude: number | null;
  observation_date: string | null;
  observation_time: string | null;
  observation_sign_id: number | null;
  survey_sample_site_id: number | null;
  survey_sample_site_name: string | null;
  method_technique_id: number | null;
  method_technique_name: string | null;
  survey_sample_period_start_datetime: string | null;
};

export type SurveyObservationWithSupplementaryData = {
  surveyObservation: {
    survey_observation_id: number;
    itis_tsn: number | null;
    itis_scientific_name: string | null;
    survey_sample_period_id: number | null;
    count: number | null;
    observation_date: string | null;
    observation_time: string | null;
    latitude: number | null;
    longitude: number | null;
    observation_sign_id: number | null;
    survey_sample_site_id: number | null;
    survey_sample_site_name: string | null;
    method_technique_id: number | null;
    method_technique_name: string | null;
    survey_sample_period_start_datetime: string | null;
    qualitative_environments: ObservationEnvironmentQualitativeObject[];
    quantitative_environments: ObservationEnvironmentQuantitativeObject[];
    subcounts: ObservationSubcountObject[];
  };
  supplementaryObservationData: SupplementaryObservationData;
};

export interface IGetSurveyObservationsResponse {
  surveyObservations: ObservationRecordWithSamplingAndSubcountData[];
  supplementaryObservationData: SupplementaryObservationData;
  pagination: ApiPaginationResponseParams;
}

export interface IGetSurveyFlattenedObservationsResponse {
  surveyObservations: FlattenedObservationRecordWithSamplingAndSubcountData[];
  supplementaryObservationData: SupplementaryObservationData;
  pagination: ApiPaginationResponseParams;
}

export interface IGetSurveyObservationsGeometryObject {
  survey_observation_id: number;
  geometry: GeoJSON.Point;
}

export interface IGetSurveyObservationsGeometryResponse {
  surveyObservationsGeometry: IGetSurveyObservationsGeometryObject[];
  supplementaryObservationData: SupplementaryObservationCountData;
}

type ObservationSamplingData = {
  survey_sample_site_id: number | null;
  survey_sample_site_name: string | null;
  method_technique_id: number | null;
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
  observation_sign_id: number | null;
};

type ObservationSubcounts = {
  subcounts: SubcountObservationColumns[];
};

export type ObservationRecord = StandardObservationColumns & ObservationEnvironmentData & ObservationSubcounts;

type ObservationRecordWithSampling = StandardObservationColumns & ObservationSamplingData;

export type SupplementaryObservationCountData = {
  observationCount: number;
};

type ObservationSamplingSupplementaryData = {
  sampling_data: GetSamplingPeriod[];
};

type SupplementaryObservationMeasurementData = {
  qualitative_measurements: CBQualitativeMeasurementTypeDefinition[];
  quantitative_measurements: CBQuantitativeMeasurementTypeDefinition[];
  qualitative_environments: EnvironmentQualitativeTypeDefinition[];
  quantitative_environments: EnvironmentQuantitativeTypeDefinition[];
};

export type SupplementaryObservationData = SupplementaryObservationCountData &
  SupplementaryObservationMeasurementData &
  ObservationSamplingSupplementaryData;

type ObservationRecordWithSamplingAndSubcountData = StandardObservationColumns &
  ObservationEnvironmentData &
  ObservationSamplingData & { subcounts: ObservationSubcountObject[] };

type FlattenedObservationRecordWithSamplingAndSubcountData = StandardObservationColumns &
  ObservationEnvironmentData &
  ObservationSamplingData & { subcount: ObservationSubcountObject };

export interface ICreateObservation {
  standardColumns: {
    itis_tsn: number | null;
    itis_scientific_name: string | null;
    survey_sample_period_id: number | null;
    count: number | null;
    observation_date: string | null;
    observation_time: string | null;
    latitude: number | null;
    longitude: number | null;
    observation_sign_id: number | null;
    qualitative_environments: ObservationEnvironmentQualitativeObject[];
    quantitative_environments: ObservationEnvironmentQuantitativeObject[];
  };
  subcounts: {
    subcount: number | null;
    qualitative_measurements: SubcountQualitativeMeasurement[];
    quantitative_measurements: SubcountQuantitativeMeasurement[];
    comment: string | null;
  }[];
}

export interface IEditObservation {
  standardColumns: {
    survey_observation_id: number;
    itis_tsn: number | null;
    itis_scientific_name: string | null;
    survey_sample_period_id: number | null;
    count: number | null;
    observation_date: string | null;
    observation_time: string | null;
    latitude: number | null;
    longitude: number | null;
    observation_sign_id: number | null;
    qualitative_environments: ObservationEnvironmentQualitativeObject[];
    quantitative_environments: ObservationEnvironmentQuantitativeObject[];
  };
  subcounts: {
    observation_subcount_id: number | undefined;
    subcount: number | null;
    qualitative_measurements: SubcountQualitativeMeasurement[];
    quantitative_measurements: SubcountQuantitativeMeasurement[];
    comment: string | null;
  }[];
}
