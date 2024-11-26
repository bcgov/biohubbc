import { IDBConnection } from '../database/db';
import { VantageMode, VantageModeRepository } from '../repositories/vantage-mode-repository';
import { DBService } from './db-service';

/**
 * Service layer for vantage mode related information
 *
 * @export
 * @class VantageModeService
 * @extends {DBService}
 */
export class VantageModeService extends DBService {
  VantageModeRepository: VantageModeRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.VantageModeRepository = new VantageModeRepository(connection);
  }

  /**
   * Get vantage modes for a set of method lookup ids
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<VantageMode[]>}
   * @memberof VantageModeService
   */
  async getVantageModesByMethodLookupIds(methodLookupIds: number[]): Promise<VantageMode[]> {
    return this.VantageModeRepository.getVantageModesByMethodLookupIds(methodLookupIds);
  }
}
