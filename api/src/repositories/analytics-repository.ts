import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

const observationCountByGroupSchema = z.object({
  count: z.number(),
  survey_sample_site_id: z.number().optional(),
  survey_sample_method_id: z.number().optional(),
  observation_date: z.string().optional(),
  itis_tsn: z.number().optional()
});

export interface IObservationCountByGroup {
  count: number;
}

export class AnalyticsRepository extends BaseRepository {
  /**
   * Gets a survey record for a given survey ID
   *
   * @param {number[]} surveyIds
   * @param {string[]} groupBy
   * @return {*}  {Promise<SurveyRecord>}
   * @memberof SurveyRepository
   */
  async getObservationCountByGroup(surveyIds: number[], groupBy: string[]): Promise<IObservationCountByGroup[]> {
    const knex = getKnex();

    const sqlStatement = knex
      .queryBuilder()
      .select(knex.raw('SUM(subcount)::NUMERIC as count'))
      .select(groupBy.map((column) => knex.raw(`?? as ??`, [column, column])))
      .from('observation_subcount as os')
      .innerJoin('survey_observation as so', 'so.survey_observation_id', 'os.survey_observation_id')
      .whereIn('survey_id', surveyIds)
      .groupBy(groupBy);

    const response = await this.connection.knex(sqlStatement, observationCountByGroupSchema);

    if (!response.rows[0]) {
      throw new ApiExecuteSQLError('Failed to get observation count by group', [
        'AnalyticsRepository->getObservationCountByGroup',
        'response was null or undefined, expected response != null'
      ]);
    }

    return response.rows;
  }
}
