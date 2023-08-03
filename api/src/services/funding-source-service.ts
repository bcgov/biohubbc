import { IDBConnection } from '../database/db';
import { FundingSourceRepository } from '../repositories/funding-source-repository';
import { DBService } from './db-service';

export class FundingSourceService extends DBService {
  fundingSourceRepository: FundingSourceRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.fundingSourceRepository = new FundingSourceRepository(connection);
  }
}
