import { IObservationRecordWithSamplingData, ISupplementaryObservationData } from 'contexts/observationsTableContext';

export interface IGetSurveyObservationsResponse {
  surveyObservations: IObservationRecordWithSamplingData[];
  supplementaryObservationData: ISupplementaryObservationData;
  pagination: {
    total: number;
    current_page: number;
    last_page: number;
    per_page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  };
}

export interface IGetSurveyObservationsGeometryResponse {
  surveyObservationsGeometry: {
    survey_observation_id: number;
    geometry: GeoJSON.Point;
  }[];
  supplementaryObservationData: ISupplementaryObservationData;
}
