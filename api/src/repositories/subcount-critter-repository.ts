import { getKnex } from '../database/db';
import { BaseRepository } from './base-repository';

export class SubCountCritterRepository extends BaseRepository {
  /**
   * Delete subcount_critter records for the given set of observation subcount ids.
   *
   * @param {number} surveyId
   * @param {number[]} observationSubcountIds
   * @return {*}  {Promise<void>}
   * @memberof SubCountRepository
   */
  async deleteSubcountCrittersByObservationSubcountId(
    surveyId: number,
    observationSubcountIds: number[]
  ): Promise<void> {
    const queryBuilder = getKnex()
      .delete()
      .from('subcount_critter')
      .innerJoin(
        'observation_subcount',
        'observation_subcount.observation_subcount_id',
        'subcount_critter.observation_subcount_id'
      )
      .innerJoin(
        'survey_observation',
        'survey_observation.survey_observation_id',
        'observation_subcount.survey_observation_id'
      )
      .whereIn('observation_subcount.observation_subcount_id', observationSubcountIds)
      .andWhere('survey_observation.survey_id', surveyId);

    await this.connection.knex(queryBuilder);
  }
}
