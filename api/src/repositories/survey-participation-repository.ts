import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

const SurveyJob = z.object({
  survey_job_id: z.number().int().positive(),
  name: z.string(),
  record_effective_date: z.string(),
  record_end_date: z.string().nullable(),
  create_date: z.string(),
  create_user: z.number().int().positive(),
  update_date: z.string().nullable(),
  update_user: z.number().int().positive().nullable(),
  revision_count: z.number().int().positive()
});

export type SurveyJob = z.infer<typeof SurveyJob>;

const SurveyParticipation = z.object({
  survey_participation_id: z.number().int().positive(),
  survey_id: z.number().int().positive(),
  system_user_id: z.number().int().positive(),
  survey_job_id: z.number().int().positive(),
  create_date: z.string(),
  create_user: z.number().int().positive(),
  update_date: z.string().nullable(),
  update_user: z.number().int().positive().nullable(),
  revision_count: z.number().int().positive()
});

export type SurveyParticipation = z.infer<typeof SurveyParticipation>;

const SurveyParticipantWithJob = z.object({
  survey_participation_id: z.number().int().positive(),
  survey_id: z.number().int().positive(),
  system_user_id: z.number().int().positive(),
  survey_job_id: z.number().int().positive(),
  survey_job_name: z.string()
});

export type SurveyParticipantWithJob = z.infer<typeof SurveyParticipantWithJob>;

export interface ISurveyParticipationPostData {
  system_user_id: number;
  job: string;
}

/**
 * A repository class for accessing survey participants data.
 *
 * @export
 * @class SurveyParticipationRepository
 * @extends {BaseRepository}
 */
export class SurveyParticipationRepository extends BaseRepository {
  /**
   * Get survey job records.
   *
   * @return {*}  {Promise<SurveyJob[]>}
   * @memberof SurveyParticipationRepository
   */
  async getSurveyJobs(): Promise<SurveyJob[]> {
    const sqlStatement = SQL`
      SELECT
        sj.survey_job_id,
        sj.name,
        sj.record_effective_date,
        sj.record_end_date,
        sj.create_date,
        sj.create_user,
        sj.update_date,
        sj.update_user,
        sj.revision_count
      FROM
        survey_job sj
      ORDER BY
        sj.name ASC;
    `;
    const response = await this.connection.sql(sqlStatement, SurveyJob);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey jobs', [
        'SurveyParticipationRepository->getSurveyJobs',
        'rows was null or undefined, expected rows != null'
      ]);
    }
    return result;
  }

  /**
   * Get a survey participant record with job name.
   *
   * @param {number} surveyId
   * @param {number} systemUserId
   * @return {*}  {(Promise<SurveyParticipantWithJob | null>)}
   * @memberof SurveyParticipationRepository
   */
  async getSurveyParticipant(surveyId: number, systemUserId: number): Promise<SurveyParticipantWithJob | null> {
    const sqlStatement = SQL`
      SELECT
        sp.survey_participation_id,
        sp.survey_id,
        sp.system_user_id,
        sp.survey_job_id,
        sj.name survey_job_name
      FROM
        survey_participation sp
      LEFT JOIN survey_job sj
        ON sp.survey_job_id = sj.survey_job_id
      WHERE
        sp.survey_id = ${surveyId}
      AND
        sp.system_user_id = ${systemUserId}
      GROUP BY
        sp.survey_id,
        sp.system_user_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement, SurveyParticipantWithJob);

    const result = (response && response.rows && response.rows[0]) || null;

    return result;
  }

  /**
   * Get a survey participant record with job name.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyParticipantWithJob[]>}
   * @memberof SurveyParticipationRepository
   */
  async getSurveyParticipants(surveyId: number): Promise<SurveyParticipantWithJob[]> {
    const sqlStatement = SQL`
      SELECT
        sp.survey_participation_id,
        sp.survey_id,
        sp.system_user_id,
        sp.survey_job_id,
        sj.name survey_job_name
      FROM
        survey_participation sp
      LEFT JOIN
        survey_job sj
      ON
        sj.survey_job_id = sp.survey_job_id
      WHERE
        sp.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, SurveyParticipantWithJob);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get survey participant', [
        'SurveyParticipationRepository->getSurveyParticipants',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  /**
   * Insert a survey participant record.
   *
   * @param {number} surveyId
   * @param {number} systemUserId
   * @param {string} surveyJobName
   * @return {*}  {Promise<void>}
   * @memberof SurveyParticipationRepository
   */
  async insertSurveyParticipant(surveyId: number, systemUserId: number, surveyJobName: string): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO survey_participation (
        survey_id,
        system_user_id,
        survey_job_id
      ) VALUES (
        ${surveyId},
        ${systemUserId},
        (SELECT survey_job_id FROM survey_job WHERE name = ${surveyJobName} LIMIT 1)
      );
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert survey participant', [
        'SurveyParticipationRepository->insertSurveyParticipant',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async updateSurveyParticipant(surveyId: number, systemUserId: number, surveyJobId: number): Promise<void> {
    //TODO: Upsert? Or delete and insert? Multiple jobs per user per survey?
    console.log('surveyJobId', surveyJobId);
    console.log('systemUserId', systemUserId);
    console.log('surveyId', surveyId);
  }
  /**
   * Delete a survey participation record.
   *
   * @param {number} surveyParticipationId
   * @return {*}  {Promise<any>}
   * @memberof SurveyParticipationRepository
   */
  async deleteSurveyParticipationRecord(surveyParticipationId: number): Promise<any> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_participation
      WHERE
        survey_participation_id = ${surveyParticipationId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey participation record', [
        'SurveyParticipationRepository->deleteSurveyParticipationRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
