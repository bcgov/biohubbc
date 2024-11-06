import { z } from 'zod';
import { getKnex } from '../database/db';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/technique-vantage-repository');

const VantageMode = z.object({
  vantage_mode_id: z.number(),
  vantage_id: z.number(),
  name: z.string(),
  description: z.string()
});

export type VantageMode = z.infer<typeof VantageMode>;

export class VantageModeRepository extends BaseRepository {
  /**
   * Get vantage modes for a set of method lookup ids
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<VantageMode[]>}
   * @memberof VantageModeRepository
   */
  async getVantageModesByMethodLookupIds(methodLookupIds: number[]): Promise<VantageMode[]> {
    defaultLog.debug({ label: 'getAttributesForMethodLookupId', methodLookupIds });

    const knex = getKnex();

    const queryBuilder = knex
      .select('vantage_mode_id', 'vantage_id', 'description')
      .from('vantage_mode as vm')
      .join('method_vantage_mode as mvm', 'mvm.vantage_mode_id', 'vm.vantage_mode_id')
      .whereIn('mvm.method_lookup_id', methodLookupIds);

    const response = await this.connection.knex(queryBuilder, VantageMode);

    return response.rows;
  }
}
