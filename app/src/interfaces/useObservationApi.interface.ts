import { IObservationRecordWithSamplingData, ISupplementaryObservationData } from 'contexts/observationsTableContext';

export interface IGetSurveyObservationsResponse {
  surveyObservations: IObservationRecordWithSamplingData[];
  supplementaryObservationData: ISupplementaryObservationData;
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface IGetSurveyObservationsGeometryResponse {
  surveyObservationsGeometry: {
    survey_observation_id: number;
    geojson: any; // TODO actually type `{ type: "Point", coordinates: [number, number] }`. Does this type exist in our app already?
  }[];
  supplementaryObservationData: ISupplementaryObservationData;
}
