import { IDBConnection } from '../database/db';
import {
  InsertObservationSubCount,
  InsertSubCountAttribute,
  SubCountRepository
} from '../repositories/subcount-repository';
import { DBService } from './db-service';

export class SubCountService extends DBService {
  subCountRepository: SubCountRepository;

  constructor(connection: IDBConnection) {
    super(connection);
    this.subCountRepository = new SubCountRepository(connection);
  }

  async insertObservationSubCount(record: InsertObservationSubCount) {
    return this.subCountRepository.insertObservationSubCount(record);
  }

  async insertSubCountAttribute(observationSubCountId: number, records: InsertSubCountAttribute[]) {
    return this.subCountRepository.insertSubCountAttribute(observationSubCountId, records);
  }
}
