import { z } from 'zod';
import { getKnex } from '../database/db';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

export const SurveyCritterRecord = z.object({
  critter_id: z.number(),
  survey_id: z.number(),
  critterbase_critter_id: z.string().uuid()
});

export type SurveyCritterRecord = z.infer<typeof SurveyCritterRecord>;

const defaultLog = getLogger('repositories/survey-repository');

export class SurveyCritterRepository extends BaseRepository {
  /**
   * Get critters in this survey
   *
   * @param {number} surveyId
   * @returns {*}
   * @member SurveyRepository
   */
  async getCrittersInSurvey(surveyId: number): Promise<SurveyCritterRecord[]> {
    defaultLog.debug({ label: 'getcrittersInSurvey', surveyId });
    const queryBuilder = getKnex().table('critter').select().where('survey_id', surveyId);
    const response = await this.connection.knex(queryBuilder);
    return response.rows;
  }

  /**
   * Add critter to survey
   *
   * @param {number} surveyId
   * @param {string} critterId
   * @returns {*}
   * @member SurveyRepository
   */
  async addCritterToSurvey(surveyId: number, critterId: string): Promise<number> {
    defaultLog.debug({ label: 'addCritterToSurvey', surveyId });
    const queryBuilder = getKnex().table('critter').insert({ survey_id: surveyId, critterbase_critter_id: critterId });
    const response = await this.connection.knex(queryBuilder);
    return response.rowCount;
  }

  /**
   * Removes a critter from the survey.
   *
   * @param surveyId
   * @param critterId
   * @returns {*}
   * @member SurveyRepository
   */
  async removeCritterFromSurvey(surveyId: number, critterId: number): Promise<number> {
    defaultLog.debug({ label: 'removeCritterFromSurvey', surveyId });
    const queryBuilder = getKnex().table('critter').delete().where({ survey_id: surveyId, critter_id: critterId });
    const response = await this.connection.knex(queryBuilder);
    return response.rowCount;
  }

  /**
   * Add a deployment to the critter.
   *
   * @param {number} critterId
   * @param {string} deplyomentId
   * @return {*}  {Promise<number>}
   * @memberof SurveyCritterRepository
   */
  async addDeployment(critterId: number, deplyomentId: string): Promise<number> {
    defaultLog.debug({ label: 'addDeployment', deplyomentId });
    const queryBuilder = getKnex()
      .table('deployment')
      .insert({ critter_id: critterId, bctw_deployment_id: deplyomentId });
    const response = await this.connection.knex(queryBuilder);
    return response.rowCount;
  }
}
