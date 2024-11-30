import { IDBConnection } from '../database/db';
import { VantageModeRepository, VantageReferenceRecord } from '../repositories/vantage-mode-repository';
import { DBService } from './db-service';

/**
 * Service layer for vantage mode related information
 *
 * @export
 * @class VantageModeService
 * @extends {DBService}
 */
export class VantageModeService extends DBService {
  vantageModeRepository: VantageModeRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.vantageModeRepository = new VantageModeRepository(connection);
  }

  /**
   * Get vantage modes for a set of method lookup ids
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<VantageReferenceRecord[]>}
   * @memberof VantageModeService
   */
  async getVantageReferenceRecordsByMethodLookupIds(methodLookupIds: number[]): Promise<VantageReferenceRecord[]> {
    return this.vantageModeRepository.getVantageReferenceRecordsByMethodLookupIds(methodLookupIds);
  }
}
