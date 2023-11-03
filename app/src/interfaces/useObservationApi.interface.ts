import { IObservationRecord } from 'contexts/observationsTableContext';

export interface IGetSurveyObservationsResponse {
  surveyObservations: IObservationRecord[];
  supplementaryObservationData: { observationCount: number };
}
