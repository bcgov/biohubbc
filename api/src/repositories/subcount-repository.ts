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

export const SubCountAttributeRecord = z.object({
  subcount_attribute_id: z.number(),
  observation_subcount_id: z.number(),
  critterbase_event_id: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable(),
  revision_count: z.number()
});
export type SubCountAttributeRecord = z.infer<typeof SubCountAttributeRecord>;
export type InsertSubCountAttribute = Pick<SubCountAttributeRecord, 'observation_subcount_id' | 'critterbase_event_id'>;

export class SubCountRepository extends BaseRepository {
  /**
   * Inserts a new observation sub count
   *
   * @param {InsertObservationSubCount} record
   * @returns {*} {Promise<ObservationSubCountRecord>}
   * @memberof SubCountRepository
   */
  async insertObservationSubCount(record: InsertObservationSubCount): Promise<ObservationSubCountRecord> {
    const qb = getKnex().insert(record).into('observation_subcount').returning('*');
    const response = await this.connection.knex(qb, ObservationSubCountRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert observation subcount', [
        'SubCountRepository->insertObservationSubCount',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Inserts a new sub count attribute
   *
   * @param {InsertSubCountAttribute} record
   * @returns {*} {Promise<SubCountAttributeRecord>}
   * @memberof SubCountRepository
   */
  async insertSubCountAttribute(record: InsertSubCountAttribute): Promise<SubCountAttributeRecord> {
    const qb = getKnex().insert(record).into('subcount_attribute').returning('*');
    const response = await this.connection.knex(qb, SubCountAttributeRecord);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert subcount attribute', [
        'SubCountRepository->insertSubCountAttribute',
        `rowCount was ${response.rowCount}, expected rowCount = 1`
      ]);
    }

    return response.rows[0];
  }

  /**
   * Deletes both sub attributes and survey sub counts for a given set of survey observation ids.
   *
   * @param surveyObservationIds
   * @memberof SubCountRepository
   */
  async deleteObservationsAndAttributeSubCounts(surveyObservationIds: number[]) {
    await this.deleteSubCountAttributeForObservationId(surveyObservationIds);
    await this.deleteObservationSubCount(surveyObservationIds);
  }

  /**
   * Deletes observation sub counts for a given set of survey observation ids.
   * `deleteSubCountAttributeForObservationId` should be run first to avoid foreign key constraints when deleting
   *
   * @param surveyObservationIds
   * @memberof SubCountRepository
   */
  async deleteObservationSubCount(surveyObservationIds: number[]) {
    const deleteObservations = SQL`
      DELETE FROM observation_subcount 
      WHERE survey_observation_id IN (${surveyObservationIds.join(', ')});
    `;
    await this.connection.sql(deleteObservations);
  }

  /**
   * Deletes sub count attributes for a given set of survey observation ids.
   * This delete action should be taken before `deleteObservationSubCount`
   *
   * @param {number[]} surveyObservationIds
   * @memberof SubCountRepository
   */
  async deleteSubCountAttributeForObservationId(surveyObservationIds: number[]) {
    const deleteAttributes = SQL`
      DELETE FROM subcount_attribute 
      WHERE observation_subcount_id IN (SELECT observation_subcount_id FROM observation_subcount os WHERE survey_observation_id IN (${surveyObservationIds.join(
        ', '
      )}));
    `;
    await this.connection.sql(deleteAttributes);
  }

  /**
   * Returns all measurement event ids for all observations in a given survey.
   *
   * @param {number} surveyId
   * @returns {*} {Promise<string[]>}
   * @memberof SubCountRepository
   */
  async getAllAttributesForSurveyId(surveyId: number): Promise<string[]> {
    const sql = SQL`
      SELECT sa.critterbase_event_id
      FROM survey_observation so, observation_subcount os, subcount_attribute sa
      WHERE so.survey_observation_id = os.survey_observation_id 
      AND os.observation_subcount_id = sa.observation_subcount_id
      AND so.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sql);
    return response.rows;
  }
}