import { IObservationRecord } from 'contexts/observationsContext';

export interface IGetSurveyObservationsResponse {
  surveyObservations: IObservationRecord[];
  supplementaryObservationData: { rowCount: number };
}
