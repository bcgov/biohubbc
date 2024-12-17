import { z } from 'zod';
import { MethodTechniqueVantageRecord } from '../database-models/method_technique_vantage';
import { VantageCategory } from '../database-models/vantage_category';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';
import { VantagePostData } from './vantage-mode-repository';

const defaultLog = getLogger('repositories/technique-vantage-repository');

export const TechniqueVantage = MethodTechniqueVantageRecord.pick({
  method_technique_vantage_id: true,
  vantage_method_id: true
}).merge(
  VantageCategory.pick({
    vantage_category_id: true
  })
);

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
   * Get vantages for a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  Promise<TechniqueVantage[]> }
   * @memberof VantageRepository
   */
  async getVantagesForTechnique(surveyId: number, methodTechniqueId: number): Promise<TechniqueVantage[]> {
    defaultLog.debug({ label: 'getVantagesForTechnique', methodTechniqueId });

    const queryBuilder = getKnex()
      .select(
        'method_technique_vantage.method_technique_vantage_id',
        'method_technique_vantage.vantage_method_id',
        'vantage.vantage_category_id'
      )
      .from('method_technique_vantage')
      .join('method_technique', 'method_technique_vantage.method_technique_id', 'method_technique.method_technique_id')
      .join('vantage_method', 'method_technique_vantage.vantage_method_id', 'vantage_method.vantage_method_id')
      .join('vantage', 'vantage_method.vantage_id', 'vantage.vantage_id')
      .join('survey', 'method_technique.survey_id', 'survey.survey_id')
      .where('survey.survey_id', surveyId)
      .where('method_technique_vantage.method_technique_id', methodTechniqueId);

    const response = await this.connection.knex(queryBuilder, TechniqueVantage);

    return response.rows;
  }
  /**
   * Insert vantages for a technique.
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantageMethods
   * @return {*}  {(Promise<{ method_technique_vantage_id: number }[] | undefined>)}
   * @memberof VantageRepository
   */
  async insertVantagesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    vantageMethods: VantagePostData[]
  ): Promise<{ method_technique_vantage_id: number }[] | undefined> {
    defaultLog.debug({ label: 'insertVantagesForTechnique', methodTechniqueId });

    if (!vantageMethods.length) {
      return;
    }

    const queryBuilder = getKnex()
      .insert(
        vantageMethods.map((vantageMethodId) => ({
          method_technique_id: methodTechniqueId,
          vantage_method_id: vantageMethodId.vantage_method_id
        }))
      )
      .into('method_technique_vantage')
      .join('method_technique', 'method_technique_vantage.method_technique_id', 'method_technique.method_technique_id')
      .join('survey', 'method_technique.survey_id', 'survey.survey_id')
      .where('survey.survey_id', surveyId)
      .returning('method_technique_vantage_id');

    const response = await this.connection.knex(queryBuilder, z.object({ method_technique_vantage_id: z.number() }));

    if (!response.rows || response.rows.length !== vantageMethods.length) {
      throw new ApiExecuteSQLError('Failed to insert vantages for technique', [
        'TechniqueVantageRepository->insertVantagesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Delete vantages for a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @param {VantagePostData[]} vantageMethods
   * @return {*}  {Promise<void>}
   * @memberof VantageRepository
   */
  async deleteVantagesForTechnique(
    surveyId: number,
    methodTechniqueId: number,
    vantageMethods: VantagePostData[]
  ): Promise<void> {
    defaultLog.debug({ label: 'deleteVantagesForTechnique', methodTechniqueId });

    if (!vantageMethods.length) {
      return;
    }

    const queryBuilder = getKnex()
      .table('method_technique_vantage')
      .delete()
      .join('method_technique', 'method_technique_vantage.method_technique_id', 'method_technique.method_technique_id')
      .join('survey', 'method_technique.survey_id', 'survey.survey_id')
      .where('survey.survey_id', surveyId)
      .where('method_technique_vantage.method_technique_id', methodTechniqueId)
      .whereIn(
        'method_technique_vantage.vantage_method_id',
        vantageMethods.map((vantageMethod) => vantageMethod.vantage_method_id)
      );

    const response = await this.connection.knex(queryBuilder);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to delete vantages for technique', [
        'TechniqueVantageRepository->deleteVantagesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Delete all vantages for a technique
   *
   * @param {number} surveyId
   * @param {number} methodTechniqueId
   * @return {*}  {Promise<void>}
   * @memberof VantageRepository
   */
  async deleteAllVantagesForTechnique(surveyId: number, methodTechniqueId: number): Promise<void> {
    defaultLog.debug({ label: 'deleteAllVantagesForTechnique', methodTechniqueId });

    const queryBuilder = getKnex()
      .table('method_technique_vantage')
      .delete()
      .join('method_technique', 'method_technique_vantage.method_technique_id', 'method_technique.method_technique_id')
      .join('survey', 'method_technique.survey_id', 'survey.survey_id')
      .where('survey.survey_id', surveyId)
      .where('method_technique_vantage.method_technique_id', methodTechniqueId);

    const response = await this.connection.knex(queryBuilder);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to delete all vantages for technique', [
        'TechniqueVantageRepository->deleteAllVantagesForTechnique',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
}
