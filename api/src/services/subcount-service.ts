import { IDBConnection } from '../database/db';
import {
  InsertObservationSubCount,
  InsertSubCountAttribute,
  ObservationSubCountRecord,
  SubCountAttributeRecord,
  SubCountRepository
} from '../repositories/subcount-repository';
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
}
