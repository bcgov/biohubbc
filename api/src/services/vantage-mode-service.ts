import { IDBConnection } from '../database/db';
import { VantageReferenceRecord, VantageRepository } from '../repositories/vantage-mode-repository';
import { DBService } from './db-service';

/**
 * Service layer for vantage related information
 *
 * @export
 * @class VantageService
 * @extends {DBService}
 */
export class VantageService extends DBService {
  vantageRepository: VantageRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.vantageRepository = new VantageRepository(connection);
  }

  /**
   * Get vantages for a set of method lookup ids
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<VantageReferenceRecord[]>}
   * @memberof VantageService
   */
  async getVantageReferenceRecordsByMethodLookupIds(methodLookupIds: number[]): Promise<VantageReferenceRecord[]> {
    return this.vantageRepository.getVantageReferenceRecordsByMethodLookupIds(methodLookupIds);
  }
}
