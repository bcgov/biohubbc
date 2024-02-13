import { IDBConnection } from '../database/db';
import {
  InsertObservationSubCount,
  InsertSubCountAttribute,
  ObservationSubCountRecord,
  SubCountAttributeRecord,
  SubCountRepository
} from '../repositories/subcount-repository';
import { CritterbaseService } from './critterbase-service';
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
   * Inserts a new sub count attribute
   *
   * @param {InsertSubCountAttribute} record
   * @returns {*} {Promise<SubCountAttributeRecord>}
   * @memberof SubCountService
   */
  async insertSubCountAttribute(records: InsertSubCountAttribute): Promise<SubCountAttributeRecord> {
    return this.subCountRepository.insertSubCountAttribute(records);
  }

  /**
   * Deletes both sub attributes and survey sub counts for a given set of survey observation ids.
   *
   * @param surveyObservationIds
   * @memberof SubCountService
   */
  async deleteObservationsAndAttributeSubCounts(surveyObservationIds: number[]) {
    return this.subCountRepository.deleteObservationsAndAttributeSubCounts(surveyObservationIds);
  }

  /**
   * Returns all measurement event ids for all observations in a given survey.
   *
   * @param {number} surveyId
   * @returns {*} {Promise<{id: string; name: string; type: string;}[]>}
   * @memberof SubCountService
   */
  async getMeasurementColumnNamesForSurvey(
    surveyId: number
  ): Promise<
    {
      id: string;
      name: string;
      type: string;
    }[]
  > {
    const service = new CritterbaseService({
      keycloak_guid: this.connection.systemUserGUID(),
      username: this.connection.systemUserIdentifier()
    });
    const eventIds = await this.subCountRepository.getAllAttributesForSurveyId(surveyId);
    const measurements = await service.getMeasurements(eventIds);
    return measurements;
  }
}
