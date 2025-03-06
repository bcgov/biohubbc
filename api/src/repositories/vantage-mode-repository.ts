import { z } from 'zod';
import { VantageRecord } from '../database-models/vantage';
import { VantageCategory } from '../database-models/vantage_category';
import { VantageMethodRecord } from '../database-models/vantage_method';
import { getKnex } from '../database/db';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/technique-vantage-repository');

export type VantagePostData = Pick<VantageMethodRecord, 'vantage_method_id'>;

export const VantageReferenceRecord = VantageCategory.omit({
  record_end_date: true
}).extend({
  vantages: z.array(
    VantageMethodRecord.omit({
      record_end_date: true,
      method_lookup_id: true,
      vantage_id: true,
      description: true
    }).merge(
      // The name and description returned come from the VantageRecord
      VantageRecord.pick({ name: true, description: true })
    )
  )
});

export type VantageReferenceRecord = z.infer<typeof VantageReferenceRecord>;

export class VantageRepository extends BaseRepository {
  /**
   * Insert vantage records for a technique.
   *
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantages
   * @return {*}  {(Promise<{ method_technique_vantage_id: number }[] | undefined>)}
   * @memberof VantageRepository
   */
  async insertVantagesForTechnique(
    methodTechniqueId: number,
    vantages: VantagePostData[]
  ): Promise<{ method_technique_vantage_id: number }[] | undefined> {
    defaultLog.debug({ label: 'insertVantagesForTechnique', methodTechniqueId });

    if (!vantages.length) {
      return;
    }

    const queryBuilder = getKnex()
      .insert(
        vantages.map((vantage) => ({
          method_technique_id: methodTechniqueId,
          vantage_method_id: vantage.vantage_method_id
        }))
      )
      .into('method_technique_vantage')
      .returning('method_technique_vantage_id');

    const response = await this.connection.knex(queryBuilder, z.object({ method_technique_vantage_id: z.number() }));

    return response.rows;
  }

  /**
   * Get vantage reference records for a set of method lookup ids.
   *
   * @param {number[]} methodLookupIds
   * @return {*}  {Promise<VantageReferenceRecord[]>}
   * @memberof VantageRepository
   */
  async getVantageReferenceRecordsByMethodLookupIds(methodLookupIds: number[]): Promise<VantageReferenceRecord[]> {
    defaultLog.debug({ label: 'getVantagesByMethodLookupIds', methodLookupIds });

    const knex = getKnex();

    const queryBuilder = knex
      .select(
        'vc.vantage_category_id',
        'vc.name',
        'vc.description',
        knex.raw(`
          json_agg(
            json_build_object(
              'vantage_method_id', vm.vantage_method_id,
              'vantage_id', v.vantage_id,
              'name', v.name,
              'description', v.description
            )
          ) as vantages
        `)
      )
      .from('vantage_method as vm')
      .join('vantage as v', 'vm.vantage_id', 'v.vantage_id')
      .join('vantage_category as vc', 'v.vantage_category_id', 'vc.vantage_category_id')
      .whereIn('vm.method_lookup_id', methodLookupIds)
      .whereNull('vm.record_end_date')
      .groupBy('vc.vantage_category_id', 'vc.name', 'vc.description');

    const response = await this.connection.knex(queryBuilder, VantageReferenceRecord);

    return response.rows;
  }
}
