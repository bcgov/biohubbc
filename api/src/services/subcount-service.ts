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

  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubCountRecord> {
    return this.subCountRepository.insertObservationSubCount(record);
  }

  async insertSubCountAttribute(records: InsertSubCountAttribute): Promise<SubCountAttributeRecord> {
    return this.subCountRepository.insertSubCountAttribute(records);
  }

  async deleteObservationsAndAttributeSubCounts(surveyObservationId: number) {
    return this.subCountRepository.deleteObservationsAndAttributeSubCounts(surveyObservationId);
  }

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
