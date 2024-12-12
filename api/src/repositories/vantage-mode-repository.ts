import { z } from 'zod';
import { VantageRecord } from '../database-models/vantage';
import { VantageModeRecord } from '../database-models/vantage_mode';
import { getKnex } from '../database/db';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/technique-vantage-repository');

export type VantagePostData = {
  vantage_mode_method_id: number;
  description: string | null;
};

export const VantageReferenceRecord = VantageRecord.omit({
  record_end_date: true
}).extend({
  vantage_modes: z.array(
    VantageModeRecord.omit({
      record_end_date: true,
    })
  )
});

export type VantageReferenceRecord = z.infer<typeof VantageReferenceRecord>;

export class VantageModeRepository extends BaseRepository {
  /**
   * Insert vantage records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantages
   * @return {*}  {(Promise<{ method_technique_vantage_mode_id: number }[] | undefined>)}
   * @memberof VantageModeRepository
   */
  async insertVantagesForTechnique(
    methodTechniqueId: number,
    vantages: VantagePostData[]
  ): Promise<{ method_technique_vantage_mode_id: number }[] | undefined> {
    defaultLog.debug({ label: 'insertVantagesForTechnique', methodTechniqueId });

    if (!vantages.length) {
      return;
    }

    const queryBuilder = getKnex()
      .insert(
        vantages.map((vantage) => ({
          method_technique_id: methodTechniqueId,
          vantage_mode_method_id: vantage.vantage_mode_method_id,
          description: vantage.description
        }))
      )
      .into('method_technique_vantage_mode')
      .returning('method_technique_vantage_mode_id');

    const response = await this.connection.knex(
      queryBuilder,
      z.object({ method_technique_vantage_mode_id: z.number() })
    );

    return response.rows;
  }
  /**
   * Get vantage reference records for a set of method lookup ids.
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<VantageReferenceRecord[]>}
   * @memberof VantageModeRepository
   */
  async getVantageReferenceRecordsByMethodLookupIds(methodLookupIds: number[]): Promise<VantageReferenceRecord[]> {
    defaultLog.debug({ label: 'getVantageModesByMethodLookupIds', methodLookupIds });

    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'v.vantage_id',
        'v.name',
        'v.description',
        knex.raw(`
          json_agg(
            json_build_object(
              'vantage_mode_id', vm.vantage_mode_id,
              'vantage_id', vm.vantage_id,
              'name', vm.name,
              'description', vm.description
            )
          ) as vantage_modes
        `)
      )
      .from('vantage_mode_method as vmm')
      .join('vantage_mode as vm', 'vmm.vantage_mode_id', 'vm.vantage_mode_id')
      .join('vantage as v', 'v.vantage_id', 'vm.vantage_id')
      .whereIn('vmm.method_lookup_id', methodLookupIds)
      .whereNull('vmm.record_end_date')
      .groupBy('v.vantage_id', 'v.name', 'v.description');

    const response = await this.connection.knex(queryBuilder, VantageReferenceRecord);

    return response.rows;
  }
}
