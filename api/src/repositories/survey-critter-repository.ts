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
    defaultLog.debug({ label: 'getCrittersInSurvey', surveyId });
    const queryBuilder = getKnex().table('critter').select().where('survey_id', surveyId);
    const response = await this.connection.knex(queryBuilder);
    return response.rows;
  }

  /**
   * Get critter Ids that a user has access to
   *
   * @param {number} isUserAdmin
   * @param {number} systemUserId
   * @returns {*}
   * @member SurveyRepository
   */
  async getCrittersByUserId(isUserAdmin: boolean, systemUserId: number): Promise<SurveyCritterRecord[]> {
    defaultLog.debug({ label: 'getCrittersInSurvey', systemUserId });

    const queryBuilder = getKnex().select('*').from('critter as c');

    console.log(isUserAdmin)

    if (!isUserAdmin) {
      queryBuilder
        .leftJoin('survey as s', 's.survey_id', 'c.survey_id')
        .leftJoin('project as p', 'p.project_id', 's.project_id')
        .leftJoin('project_participation as pp', 'pp.project_id', 'p.project_id')
        .where('pp.system_user_id', systemUserId);
    }

    const response = await this.connection.knex(queryBuilder);

    console.log(response.rows)

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
  async addCritterToSurvey(surveyId: number, critterId: string): Promise<void> {
    defaultLog.debug({ label: 'addCritterToSurvey', surveyId });
    const queryBuilder = getKnex().table('critter').insert({ survey_id: surveyId, critterbase_critter_id: critterId });
    await this.connection.knex(queryBuilder);
  }

  async updateCritter(critterId: number, critterbaseCritterId: string): Promise<void> {
    defaultLog.debug({ label: 'updateCritter', critterId });
    const queryBuilder = getKnex()
      .table('critter')
      .update({ critterbase_critter_id: critterbaseCritterId })
      .where({ critter_id: critterId });
    await this.connection.knex(queryBuilder);
  }

  /**
   * Removes a critter from the survey.
   *
   * @param surveyId
   * @param critterId
   * @returns {*}
   * @member SurveyRepository
   */
  async removeCritterFromSurvey(surveyId: number, critterId: number): Promise<void> {
    defaultLog.debug({ label: 'removeCritterFromSurvey', critterId });

    const queryBuilder = getKnex()
      .delete()
      .from('critter')
      .where({ critter_id: critterId })
      .andWhere({ survey_id: surveyId });

    await this.connection.knex(queryBuilder);
  }

  /**
   * Will insert a new critter - deployment uuid association, or update if it already exists.
   * This update operation intentionally changes nothing. Only really being done to trigger update audit columns.
   * @param {number} critterId
   * @param {string} deplyomentId
   * @returns {*}
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
   * @returns {*}
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
