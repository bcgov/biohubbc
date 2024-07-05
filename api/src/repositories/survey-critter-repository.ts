import { z } from 'zod';
import { getKnex } from '../database/db';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/survey-repository');

export const SurveyCritterRecord = z.object({
  critter_id: z.number(),
  survey_id: z.number(),
  critterbase_critter_id: z.string().uuid()
});

export type SurveyCritterRecord = z.infer<typeof SurveyCritterRecord>;

/**
 * Repository layer for survey critters.
 *
 * @export
 * @class SurveyCritterRepository
 * @extends {BaseRepository}
 */
export class SurveyCritterRepository extends BaseRepository {
  /**
   * Get critters in this survey
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyCritterRecord[]>}
   * @memberof SurveyCritterRepository
   */
  async getCrittersInSurvey(surveyId: number): Promise<SurveyCritterRecord[]> {
    defaultLog.debug({ label: 'getCrittersInSurvey', surveyId });

    const queryBuilder = getKnex().table('critter').select().where('survey_id', surveyId);

    const response = await this.connection.knex(queryBuilder);

    return response.rows;
  }

  /**
   * Get critter in survey
   *
   * @param {number} surveyId
   * @param {number} critterId
   * @return {*}  {Promise<SurveyCritterRecord>}
   * @memberof SurveyCritterRepository
   */
  async getCritterInSurvey(surveyId: number, critterId: number): Promise<SurveyCritterRecord | undefined> {
    defaultLog.debug({ label: 'getCritter', critterId });

    const queryBuilder = getKnex().table('critter').select().where({
      survey_id: surveyId,
      critter_id: critterId
    });

    const response = await this.connection.knex(queryBuilder);

    return response.rows[0];
  }

  /**
   * Add critters to survey.
   *
   * @param {number} surveyId
   * @param {string[]} critterIds
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterRepository
   */
  async addCrittersToSurvey(surveyId: number, critterIds: string[]): Promise<number[]> {
    defaultLog.debug({ label: 'addCrittersToSurvey', surveyId });

    const queryBuilder = getKnex()
      .table('critter')
      .insert(critterIds.map((critterId) => ({ survey_id: surveyId, critterbase_critter_id: critterId })))
      .returning('critter_id');

    const response = await this.connection.knex(queryBuilder);

    return response.rows.map((row) => row.critter_id);
  }

  /**
   * Updates the critterbase_critter_id for a critter.
   *
   * @param {number} critterId
   * @param {string} critterbaseCritterId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterRepository
   */
  async updateCritter(critterId: number, critterbaseCritterId: string): Promise<void> {
    defaultLog.debug({ label: 'updateCritter', critterId });

    const queryBuilder = getKnex()
      .table('critter')
      .update({ critterbase_critter_id: critterbaseCritterId })
      .where({ critter_id: critterId });

    await this.connection.knex(queryBuilder);
  }

  /**
   * Removes critters from the survey.
   *
   * @param {number} surveyId
   * @param {number[]} critterIds
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterRepository
   */
  async removeCrittersFromSurvey(surveyId: number, critterIds: number[]): Promise<void> {
    defaultLog.debug({ label: 'removeCrittersFromSurvey', critterIds });

    const queryBuilder = getKnex()
      .delete()
      .from('critter')
      .whereIn('critter_id', critterIds)
      .andWhere({ survey_id: surveyId });

    await this.connection.knex(queryBuilder);
  }

  /**
   * Will insert a new critter - deployment uuid association, or update if it already exists.
   * This update operation intentionally changes nothing. Only really being done to trigger update audit columns.
   *
   * @param {number} critterId
   * @param {string} deplyomentId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterRepository
   */
  async upsertDeployment(critterId: number, deplyomentId: string): Promise<void> {
    defaultLog.debug({ label: 'addDeployment', deplyomentId });

    const queryBuilder = getKnex()
      .table('deployment')
      .insert({ critter_id: critterId, bctw_deployment_id: deplyomentId })
      .onConflict(['critter_id', 'bctw_deployment_id'])
      .merge(['critter_id', 'bctw_deployment_id']);

    await this.connection.knex(queryBuilder);
  }

  /**
   * Deletes a deployment row.
   *
   * @param {number} critterId
   * @param {string} deploymentId
   * @return {*}  {Promise<void>}
   * @memberof SurveyCritterRepository
   */
  async removeDeployment(critterId: number, deploymentId: string): Promise<void> {
    defaultLog.debug({ label: 'removeDeployment', deploymentId });

    const queryBuilder = getKnex()
      .table('deployment')
      .where({ critter_id: critterId, bctw_deployment_id: deploymentId })
      .delete();

    await this.connection.knex(queryBuilder);
  }
}
