import { IObservationRecordWithSamplingData, ISupplementaryObservationData } from 'contexts/observationsTableContext';
import { ApiPaginationResponseParams } from 'types/misc';

export interface IGetSurveyObservationsResponse {
  surveyObservations: IObservationRecordWithSamplingData[];
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
