import { IDBConnection } from '../database/db';
import { InsertObservation, ObservationRecord, ObservationRepository, UpdateObservation } from '../repositories/observation-repository';
import { DBService } from './db-service';

export class ObservationService extends DBService {
  observationRepository: ObservationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationRepository = new ObservationRepository(connection);
  }

  /**
   * TODO
   *
   * @param {((Observation | ObservationRecord)[])} observations
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async insertUpdateSurveyObservations(observations: (InsertObservation | UpdateObservation)[]): Promise<ObservationRecord[]> {
    return this.observationRepository.insertUpdateSurveyObservations(observations);
  }

  /**
   * TODO
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async getSurveyObservations(surveyId: number): Promise<ObservationRecord[]> {
    return this.observationRepository.getSurveyObservations(surveyId);
  }

}
