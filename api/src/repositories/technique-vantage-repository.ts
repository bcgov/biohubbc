import { z } from 'zod';
import { getKnex } from '../database/db';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/technique-vantage-repository');

export type VantagePostData = {
  vantage_mode_method_id: number;
  description: string | null;
};

const TechniqueVantage = z.object({
  method_Technique_vantage_mode_id: z.number(),
  method_technique_id: z.number(),
  vantage_mode_method_id: z.number(),
  description: z.string().nullable()
});

export type TechniqueVantage = z.infer<typeof TechniqueVantage>;

/**
 * Repository for technique vantage related information.
 *
 * @export
 * @class TechniqueVantageRepository
 * @extends {BaseRepository}
 */
export class TechniqueVantageRepository extends BaseRepository {
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
}
