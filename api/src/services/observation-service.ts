import { IDBConnection } from '../database/db';
import {
  InsertObservation,
  ObservationRecord,
  ObservationRepository,
  UpdateObservation
} from '../repositories/observation-repository';
import { DBService } from './db-service';

export class ObservationService extends DBService {
  observationRepository: ObservationRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.observationRepository = new ObservationRepository(connection);
  }

  /**
   * Performs an upsert for all observation records belonging to the given survey, then
   * returns the updated rows
   *
   * @param {number} surveyId
   * @param {((Observation | ObservationRecord)[])} observations
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async insertUpdateSurveyObservations(
    surveyId: number,
    observations: (InsertObservation | UpdateObservation)[]
  ): Promise<ObservationRecord[]> {
    return this.observationRepository.insertUpdateSurveyObservations(surveyId, observations);
  }

  /**
   * Retrieves all observation records for the given survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<ObservationRecord[]>}
   * @memberof ObservationService
   */
  async getSurveyObservations(surveyId: number): Promise<ObservationRecord[]> {
    return this.observationRepository.getSurveyObservations(surveyId);
  }
}
