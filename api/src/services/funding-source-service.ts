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

  /**
   * Fetch a single funding source by id.
   *
   * @param {number} fundingSourceId
   * @return {*}  {Promise<FundingSource>}
   * @memberof FundingSourceService
   */
  async getFundingSourceById(fundingSourceId: number): Promise<FundingSource> {
    return this.fundingSourceRepository.getFundingSourceById(fundingSourceId);
  }

  /**
   * Update a single funding source.
   *
   * @param {FundingSource} fundingSource
   * @return {*}  {Promise<Pick<FundingSource, 'funding_source_id'>>}
   * @memberof FundingSourceService
   */
  async putFundingSource(fundingSource: FundingSource): Promise<Pick<FundingSource, 'funding_source_id'>> {
    return this.fundingSourceRepository.putFundingSource(fundingSource);
  }
}
