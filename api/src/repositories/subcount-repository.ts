import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export const ObservationSubCountRecord = z.object({
  observation_subcount_id: z.number(),
  survey_observation_id: z.number(),
  subcount: z.number().nullable(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type ObservationSubCountRecord = z.infer<typeof ObservationSubCountRecord>;
export type InsertObservationSubCount = Pick<ObservationSubCountRecord, 'survey_observation_id' | 'subcount'>;

export const SubCountEventRecord = z.object({
  subcount_event_id: z.number(),
  observation_subcount_id: z.number(),
  critterbase_event_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SubCountEventRecord = z.infer<typeof SubCountEventRecord>;
export type InsertSubCountEvent = Pick<SubCountEventRecord, 'observation_subcount_id' | 'critterbase_event_id'>;

export class SubCountRepository extends BaseRepository {
  /**
   * Inserts a new observation_subcount record
   *
   * @param {InsertObservationSubCount} record
   * @returns {*} {Promise<ObservationSubCountRecord>}
   * @memberof SubCountRepository
   */
  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubCountRecord> {
    const queryBuilder = getKnex().insert(record).into('observation_subcount').returning('*');

    const response = await this.connection.knex(queryBuilder, ObservationSubCountRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert observation subcount', [
        'SubCountRepository->insertObservationSubCount',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new subcount_event record.
   *
   * @param {InsertSubCountEvent} record
   * @returns {*} {Promise<SubCountEventRecord>}
   * @memberof SubCountRepository
   */
  async insertSubCountEvent(record: InsertSubCountEvent): Promise<SubCountEventRecord> {
    const queryBuilder = getKnex().insert(record).into('subcount_event').returning('*');

    const response = await this.connection.knex(queryBuilder, SubCountEventRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert subcount event', [
        'SubCountRepository->insertSubCountEvent',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new subcount_critter record.
   *
   * TODO: Implement this function fully. The incoming `record` parameter and the return value are of type `unknown`.
   *
   * @param {unknown} record
   * @return {*}  {Promise<unknown>}
   * @memberof SubCountRepository
   */
  async insertSubCountCritter(record: unknown): Promise<unknown> {
    const queryBuilder = getKnex().insert(record).into('subcount_critter').returning('*');

    const response = await this.connection.knex(queryBuilder);

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
   * Note: Also deletes all related child records (subcount_critter, subcount_event).
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @memberof SubCountRepository
   */
  async deleteObservationSubCountRecords(surveyId: number, surveyObservationIds: number[]) {
    const queryBuilder = getKnex()
      .delete()
      .from('observation_subcount')
      .innerJoin(
        'survey_observation',
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .whereIn('survey_observation_id', surveyObservationIds)
      .andWhere('survey_observation.survey_id', surveyId);

    // Delete child subcount_critter records
    await this.deleteSubCountCritterRecordsForObservationId(surveyId, surveyObservationIds);

    // Delete child subcount_evemt records
    await this.deleteSubCountEventRecordsForObservationId(surveyId, surveyObservationIds);

    // Delete observation_subcount records
    const response = await this.connection.knex(queryBuilder);

    if (response[2].rowCount !== surveyObservationIds.length) {
      throw new ApiExecuteSQLError('Failed to delete observation subcount records', [
        'SubCountRepository->deleteObservationSubCount',
        `response[2].rowCount was ${response[2].rowCount}, expected rowCount = ${surveyObservationIds.length}`
      ]);
    }
  }

  /**
   * Delete subcount_event records for the given set of survey observation ids.
   *
   * @param {number} surveyId
   * @param {number[]} surveyObservationIds
   * @return {*}
   * @memberof SubCountRepository
   */
  async deleteSubCountEventRecordsForObservationId(surveyId: number, surveyObservationIds: number[]) {
    const queryBuilder = getKnex()
      .delete()
      .from('subcount_event')
      .innerJoin(
        'observation_subcount',
        'observation_subcount.observation_subcount_id',
        'subcount_event.observation_subcount_id'
      )
      .innerJoin(
        'survey_observation',
        'observation_subcount.survey_observation_id',
        'survey_observation.survey_observation_id'
      )
      .whereIn('survey_observation_id', surveyObservationIds)
      .andWhere('survey_observation.survey_id', surveyId);

    return this.connection.knex(queryBuilder);
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
      .whereIn('survey_observation_id', surveyObservationIds)
      .andWhere('survey_observation.survey_id', surveyId);

    return this.connection.knex(queryBuilder);
  }

  /**
   * Returns all subcount event records for all observations in a given survey.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SubCountEventRecord[]>}
   * @memberof SubCountRepository
   */
  async getSubCountEventRecordsBySurveyId(surveyId: number): Promise<SubCountEventRecord[]> {
    const sql = SQL`
      SELECT 
        subcount_event.*
      FROM 
        survey_observation, 
        observation_subcount, 
        subcount_event
      WHERE 
        survey_observation.survey_observation_id = observation_subcount.survey_observation_id 
      AND 
        observation_subcount.observation_subcount_id = subcount_event.observation_subcount_id
      AND 
        survey_observation.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sql, SubCountEventRecord);

    return response.rows;
  }
}
