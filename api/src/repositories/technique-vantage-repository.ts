import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';
import { VantagePostData } from './vantage-mode-repository';

const defaultLog = getLogger('repositories/technique-vantage-repository');

export const TechniqueVantage = z.object({
  method_technique_vantage_mode_id: z.number(),
  vantage_mode_method_id: z.number(),
  vantage_mode_category_id: z.number()
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
   * Get vantage modes for a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  Promise<TechniqueVantage[]> }
   * @memberof VantageModeRepository
   */
  async getVantageModesForTechnique(surveyId: number, methodTechniqueId: number): Promise<TechniqueVantage[]> {
    defaultLog.debug({ label: 'getVantageModesForTechnique', methodTechniqueId });

    const queryBuilder = getKnex()
      .select(
        'method_technique_vantage_mode.method_technique_vantage_mode_id',
        'method_technique_vantage_mode.vantage_mode_method_id',
        'vantage_mode.vantage_mode_category_id'
      )
      .from('method_technique_vantage_mode')
      .join(
        'method_technique',
        'method_technique_vantage_mode.method_technique_id',
        'method_technique.method_technique_id'
      )
      .join(
        'vantage_mode_method',
        'method_technique_vantage_mode.vantage_mode_method_id',
        'vantage_mode_method.vantage_mode_method_id'
      )
      .join('vantage_mode', 'vantage_mode_method.vantage_mode_id', 'vantage_mode.vantage_mode_id')
      .join('survey', 'method_technique.survey_id', 'survey.survey_id')
      .where('survey.survey_id', surveyId)
      .where('method_technique_vantage_mode.method_technique_id', methodTechniqueId);

    const response = await this.connection.knex(queryBuilder, TechniqueVantage);

    return response.rows;
  }
  /**
   * Insert vantage modes for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantageModeMethods
   * @return {*}  {(Promise<{ method_technique_vantage_mode_id: number }[] | undefined>)}
   * @memberof VantageModeRepository
   */
  async insertVantageModesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    vantageModeMethods: VantagePostData[]
  ): Promise<{ method_technique_vantage_mode_id: number }[] | undefined> {
    defaultLog.debug({ label: 'insertVantageModesForTechnique', methodTechniqueId });

    if (!vantageModeMethods.length) {
      return;
    }

    const queryBuilder = getKnex()
      .insert(
        vantageModeMethods.map((vantageModeMethodId) => ({
          method_technique_id: methodTechniqueId,
          vantage_mode_method_id: vantageModeMethodId.vantage_mode_method_id
        }))
      )
      .into('method_technique_vantage_mode')
      .join(
        'method_technique',
        'method_technique_vantage_mode.method_technique_id',
        'method_technique.method_technique_id'
      )
      .join('survey', 'method_technique.survey_id', 'survey.survey_id')
      .where('survey.survey_id', surveyId)
      .returning('method_technique_vantage_mode_id');

    const response = await this.connection.knex(
      queryBuilder,
      z.object({ method_technique_vantage_mode_id: z.number() })
    );

    if (!response.rows || response.rows.length !== vantageModeMethods.length) {
      throw new ApiExecuteSQLError('Failed to insert vantage modes for technique', [
        'TechniqueVantageRepository->insertVantageModesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Delete vantage modes for a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantageModeMethods
   * @return {*}  {Promise<void>}
   * @memberof VantageModeRepository
   */
  async deleteVantageModesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    vantageModeMethods: VantagePostData[]
  ): Promise<void> {
    defaultLog.debug({ label: 'deleteVantageModesForTechnique', methodTechniqueId });

    if (!vantageModeMethods.length) {
      return;
    }

    const queryBuilder = getKnex()
      .table('method_technique_vantage_mode')
      .delete()
      .join(
        'method_technique',
        'method_technique_vantage_mode.method_technique_id',
        'method_technique.method_technique_id'
      )
      .join('survey', 'method_technique.survey_id', 'survey.survey_id')
      .where('survey.survey_id', surveyId)
      .where('method_technique_vantage_mode.method_technique_id', methodTechniqueId)
      .whereIn(
        'method_technique_vantage_mode.vantage_mode_method_id',
        vantageModeMethods.map((vantageModeMethod) => vantageModeMethod.vantage_mode_method_id)
      );

    const response = await this.connection.knex(queryBuilder);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to delete vantage modes for technique', [
        'TechniqueVantageRepository->deleteVantageModesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Delete all vantage modes for a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<void>}
   * @memberof VantageModeRepository
   */
  async deleteAllVantageModesForTechnique(surveyId: number, methodTechniqueId: number): Promise<void> {
    defaultLog.debug({ label: 'deleteAllVantageModesForTechnique', methodTechniqueId });

    const queryBuilder = getKnex()
      .table('method_technique_vantage_mode')
      .delete()
      .join(
        'method_technique',
        'method_technique_vantage_mode.method_technique_id',
        'method_technique.method_technique_id'
      )
      .join('survey', 'method_technique.survey_id', 'survey.survey_id')
      .where('survey.survey_id', surveyId)
      .where('method_technique_vantage_mode.method_technique_id', methodTechniqueId);

    const response = await this.connection.knex(queryBuilder);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to delete all vantage modes for technique', [
        'TechniqueVantageRepository->deleteAllVantageModesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
}
