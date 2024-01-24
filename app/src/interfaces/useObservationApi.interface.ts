import { IObservationRecord, ISupplementaryObservationData } from 'contexts/observationsTableContext';

export interface IGetSurveyObservationsResponse {
  surveyObservations: IObservationRecord[];
  supplementaryObservationData: ISupplementaryObservationData;
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}
