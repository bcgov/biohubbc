import { ObservationSubcountModel, ObservationSubcountRecord } from '../database-models/observation_subcount';
import { SubcountCritterModel, SubcountCritterRecord } from '../database-models/subcount_critter';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export type InsertObservationSubCount = Pick<
  ObservationSubcountRecord,
  'survey_observation_id' | 'subcount' | 'comment'
>;

export class SubCountRepository extends BaseRepository {
  /**
   * Inserts a new observation_subcount record
   *
   * @param {InsertObservationSubCount} record
   * @returns {*} {Promise<ObservationSubcountModel>}
   * @memberof SubCountRepository
   */
  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubcountModel> {
    const queryBuilder = getKnex().insert(record).into('observation_subcount').returning('*');

    const response = await this.connection.knex(queryBuilder, ObservationSubcountModel);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert observation subcount', [
        'SubCountRepository->insertObservationSubCount',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new subcount_critter record.
   *
   * @param {SubCountCritterRecord} subcountCritter
   * @return {*}  {Promise<SubcountCritterModel>}
   * @memberof SubCountRepository
   */
  async insertSubCountCritter(subcountCritter: SubcountCritterRecord): Promise<SubcountCritterModel> {
    const queryBuilder = getKnex().insert(subcountCritter).into('subcount_critter').returning('*');

    const response = await this.connection.knex(queryBuilder, SubcountCritterModel);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert subcount critter', [
        'SubCountRepository->insertSubCountCritter',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Delete observation_subcount records for the given set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}  {Promise<void>}
   * @memberof SubCountRepository
   */
  async deleteObservationSubCountRecords(surveyId: number, surveyObservationIds: number[]): Promise<void> {
    const queryBuilder = getKnex()
      .delete()
      .from('observation_subcount')
      .innerJoin(
        'survey_observation',
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .whereIn('observation_subcount.survey_observation_id', surveyObservationIds)
      .andWhere('survey_observation.survey_id', surveyId);

    // Delete observation_subcount records, if any
    await this.connection.knex(queryBuilder);
  }

  /**
   * Delete subcount_critter records for a given set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}
   * @memberof SubCountRepository
   */
  async deleteSubCountCritterRecordsForObservationId(surveyId: number, surveyObservationIds: number[]) {
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
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .whereIn('observation_subcount.survey_observation_id', surveyObservationIds)
      .andWhere('survey_observation.survey_id', surveyId);

    return this.connection.knex(queryBuilder);
  }
}
