import SQL from 'sql-template-strings';
import { z } from 'zod';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';
import { SystemUser } from './user-repository';

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

const SurveyUser = z.object({
  survey_participation_id: z.number().int().positive(),
  survey_id: z.number().int().positive(),
  system_user_id: z.number().int().positive(),
  survey_job_id: z.number().int().positive(),
  survey_job_name: z.string()
});

export type SurveyUser = z.infer<typeof SurveyUser>;

export interface ISurveyParticipationPostData {
  system_user_id: number;
  survey_job_name: string;
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

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to get survey jobs', [
        'SurveyParticipationRepository->getSurveyJobs',
        'rows was null or undefined, expected rows != null'
      ]);
    }
    return response.rows;
  }

  /**
   * Get a survey participant record.
   *
   * @param {number} surveyId
   * @param {number} systemUserId
   * @return {*}  {(Promise<SurveyUser | null>)}
   * @memberof SurveyParticipationRepository
   */
  async getSurveyParticipant(surveyId: number, systemUserId: number): Promise<(SurveyUser & SystemUser) | null> {
    const sqlStatement = SQL`
      SELECT
        su.system_user_id,
        su.user_identifier,
        su.user_guid,
        su.record_end_date,
        uis.name AS identity_source,
        array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
        array_remove(array_agg(sr.name), NULL) AS role_names,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        sp.survey_participation_id,
        sp.survey_id,
        sp.survey_job_id,
        sj.name survey_job_name
      FROM
        survey_participation sp
        LEFT JOIN
        survey_job sj
        ON sj.survey_job_id = sp.survey_job_id
      LEFT JOIN system_user su
        ON sp.system_user_id = su.system_user_id
      LEFT JOIN
        system_user_role sur
        ON su.system_user_id = sur.system_user_id
      LEFT JOIN
        system_role sr
        ON sur.system_role_id = sr.system_role_id
      LEFT JOIN
        user_identity_source uis
        ON uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        sp.survey_id = ${surveyId}
      AND
        sp.system_user_id = ${systemUserId}
      GROUP BY
        su.system_user_id,
        su.record_end_date,
        su.user_identifier,
        su.user_guid,
        uis.name,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        sp.survey_participation_id,
        sp.survey_job_id,
        sp.survey_id,
        sj.name,
        sp.create_date
      ORDER BY
        sp.create_date DESC;
      `;

    const response = await this.connection.sql(sqlStatement, SurveyUser.merge(SystemUser));

    return response.rows?.[0] || null;
  }

  /**
   * Get survey participant records.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<SurveyUser[]>}
   * @memberof SurveyParticipationRepository
   */
  async getSurveyParticipants(surveyId: number): Promise<(SurveyUser & SystemUser)[]> {
    const sqlStatement = SQL`
      SELECT
        su.system_user_id,
        su.user_identifier,
        su.user_guid,
        su.record_end_date,
        uis.name AS identity_source,
        array_remove(array_agg(sr.system_role_id), NULL) AS role_ids,
        array_remove(array_agg(sr.name), NULL) AS role_names,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        sp.survey_participation_id,
        sp.survey_id,
        sp.survey_job_id,
        sj.name survey_job_name
      FROM
        survey_participation sp
      LEFT JOIN
        survey_job sj
        ON sj.survey_job_id = sp.survey_job_id
      LEFT JOIN system_user su
        ON sp.system_user_id = su.system_user_id
      LEFT JOIN
        system_user_role sur
        ON su.system_user_id = sur.system_user_id
      LEFT JOIN
        system_role sr
        ON sur.system_role_id = sr.system_role_id
      LEFT JOIN
        user_identity_source uis
        ON uis.user_identity_source_id = su.user_identity_source_id
      WHERE
        sp.survey_id = ${surveyId}
      AND
        su.record_end_date is NULL
      GROUP BY
        su.system_user_id,
        su.record_end_date,
        su.user_identifier,
        su.user_guid,
        uis.name,
        su.email,
        su.display_name,
        su.given_name,
        su.family_name,
        su.agency,
        sp.survey_participation_id,
        sp.survey_job_id,
        sp.survey_id,
        sj.name,
        sp.create_date
      ORDER BY
        sp.create_date DESC;
    `;

    const response = await this.connection.sql(sqlStatement, SurveyUser.merge(SystemUser));

    return response.rows;
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

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert survey participant', [
        'SurveyParticipationRepository->insertSurveyParticipant',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Update a survey participant record.
   *
   * @param {number} surveyId
   * @param {number} surveyParticipationId
   * @param {string} surveyJobName
   * @return {*}  {Promise<void>}
   * @memberof SurveyParticipationRepository
   */
  async updateSurveyParticipantJob(surveyId: number, surveyParticipationId: number, surveyJobName: string): Promise<void> {
    const sqlStatement = SQL`
      UPDATE survey_participation
      SET
        survey_job_id = (SELECT survey_job_id FROM survey_job WHERE name = ${surveyJobName} LIMIT 1)
      WHERE
        survey_participation_id = ${surveyParticipationId}
      AND
        survey_id = ${surveyId}
      ;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to update survey participant', [
        'SurveyParticipationRepository->updateSurveyParticipant',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
  /**
   * Delete a survey participation record.
   *
   * @param {number} surveyId
   * @param {number} surveyParticipationId
   * @return {*}  {Promise<any>}
   * @memberof SurveyParticipationRepository
   */
  async deleteSurveyParticipationRecord(surveyId: number, surveyParticipationId: number): Promise<any> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_participation
      WHERE
        survey_participation_id = ${surveyParticipationId}
      AND
        survey_id = ${surveyId}
      RETURNING
        *;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response?.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey participation record', [
        'SurveyParticipationRepository->deleteSurveyParticipationRecord',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }
}
