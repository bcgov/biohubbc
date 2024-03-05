import { ISupplementaryObservationData } from 'contexts/observationsTableContext';
import { ApiPaginationResponseParams } from 'types/misc';
import { IObservationRecordWithSamplingDataWithAttributes } from '../contexts/observationsTableContext';

export interface IGetSurveyObservationsResponse {
  surveyObservations: IObservationRecordWithSamplingDataWithAttributes[];
  supplementaryObservationData: ISupplementaryObservationData;
  pagination: ApiPaginationResponseParams;
}

export interface IGetSurveyObservationsGeometryResponse {
  surveyObservationsGeometry: {
    survey_observation_id: number;
    geometry: GeoJSON.Point;
  }[];
  supplementaryObservationData: ISupplementaryObservationData;
}
