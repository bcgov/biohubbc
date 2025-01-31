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
  SubcountQuantitativeMeasurement,
  SubcountToSave
} from 'interfaces/useObservationApi.interface';
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

export interface IGetSurveyObservationsGeometryObject {
  survey_observation_id: number;
  geometry: GeoJSON.Point;
}

export interface IGetSurveyObservationsGeometryResponse {
  surveyObservationsGeometry: IGetSurveyObservationsGeometryObject[];
  supplementaryObservationData: SupplementaryObservationCountData;
}

export type ObservationSamplingData = {
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
  observation_sign_id: number | null;
};

export type ObservationRecord = StandardObservationColumns & ObservationEnvironmentData & SubcountObservationColumns;

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

type ObservationSubcountsObject = {
  subcounts: ObservationSubcountObject[];
};

type ObservationRecordWithSamplingAndSubcountData = StandardObservationColumns &
  ObservationEnvironmentData &
  ObservationSamplingData &
  ObservationSubcountsObject;

export interface ICreateEditObservation {
  standardColumns: StandardObservationColumns & ObservationEnvironmentData;
  subcounts: SubcountToSave[];
}

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
    count: number | null;
    qualitative_measurements: SubcountQualitativeMeasurement[];
    quantitative_measurements: SubcountQuantitativeMeasurement[];
    comment: string | null;
  }[];
}
