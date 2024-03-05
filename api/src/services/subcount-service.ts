import { IDBConnection } from '../database/db';
import {
  InsertObservationSubCount,
  InsertSubCountEvent,
  ObservationSubCountRecord,
  SubCountEventRecord,
  SubCountRepository
} from '../repositories/subcount-repository';
import { CBMeasurementType, CritterbaseService } from './critterbase-service';
import { DBService } from './db-service';

export class SubCountService extends DBService {
  subCountRepository: SubCountRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.subCountRepository = new SubCountRepository(connection);
  }

  /**
   * Inserts a new observation sub count
   *
   * @param {InsertObservationSubCount} record
   * @returns {*} {Promise<ObservationSubCountRecord>}
   * @memberof SubCountService
   */
  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubCountRecord> {
    return this.subCountRepository.insertObservationSubCount(record);
  }

  /**
   * Inserts a new sub count event
   *
   * @param {InsertSubCountEvent} record
   * @returns {*} {Promise<SubCountEventRecord>}
   * @memberof SubCountService
   */
  async insertSubCountEvent(records: InsertSubCountEvent): Promise<SubCountEventRecord> {
    return this.subCountRepository.insertSubCountEvent(records);
  }

  /**
   * Delete observation_subcount records for the given set of survey observation ids.
   *
   * Note: Also deletes all related child records (subcount_critter, subcount_event).
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}  {Promise<void>}
   * @memberof SubCountService
   */
  async deleteObservationSubCountRecords(surveyId: number, surveyObservationIds: number[]): Promise<void> {
    // Delete child subcount_critter records, if any
    await this.subCountRepository.deleteSubCountCritterRecordsForObservationId(surveyId, surveyObservationIds);

    // Delete child subcount_event records, if any
    await this.subCountRepository.deleteSubCountEventRecordsForObservationId(surveyId, surveyObservationIds);

    // Delete observation_subcount records, if any
    return this.subCountRepository.deleteObservationSubCountRecords(surveyId, surveyObservationIds);
  }

  /**
   * Returns all measurement event ids for all observations in a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<CBMeasurementType[]>}
   * @memberof SubCountService
   */
  async getMeasurementTypeDefinitionsForSurvey(surveyId: number): Promise<CBMeasurementType[]> {
    const service = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });

    const subcountEventRecords = await this.subCountRepository.getSubCountEventRecordsBySurveyId(surveyId);

    const eventIds = subcountEventRecords.map((record) => record.critterbase_event_id);

    return service.getMeasurementTypeDefinitionsForEventIds(eventIds);
  }
}
