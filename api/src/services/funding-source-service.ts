import { IDBConnection } from '../database/db';
import { FundingSource, FundingSourceRepository } from '../repositories/funding-source-repository';
import { DBService } from './db-service';

export interface IFundingSourceSearchParams {
  name?: string;
}

export class FundingSourceService extends DBService {
  fundingSourceRepository: FundingSourceRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.fundingSourceRepository = new FundingSourceRepository(connection);
  }

  /**
   * Get all funding sources.
   *
   * @return {*}  {Promise<FundingSource[]>}
   * @memberof FundingSourceService
   */
  async getFundingSources(searchParams: IFundingSourceSearchParams): Promise<FundingSource[]> {
    return this.fundingSourceRepository.getFundingSources(searchParams);
  }
}
