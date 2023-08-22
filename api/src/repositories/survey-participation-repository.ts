import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export interface ISurveyParticipation {
  survey_participation_id?: number;
  survey_id: number;
  system_user_id: number;
  survey_job_id: number;
}

/**
 * A repository class for accessing survey participants data.
 *
 * @export
 * @class SurveyParticipationRepository
 * @extends {BaseRepository}
 */
export class SurveyParticipationRepository extends BaseRepository {
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

  async getSurveyParticipant(surveyId: number, systemUserId: number): Promise<ISurveyParticipation | null> {
    const sqlStatement = SQL`
      SELECT
        sp.survey_id,
        sp.system_user_id,
        su.record_end_date,
        sj.name
      FROM
        survey_participation sp
      LEFT JOIN survey_job sj
        ON sp.survey_job_id = sj.survey_job_id
      LEFT JOIN system_user su
        ON sp.system_user_id = su.system_user_id
      WHERE
        sp.survey_id = ${surveyId}
      AND
        sp.system_user_id = ${systemUserId}
      AND
        su.record_end_date is NULL
      GROUP BY
        sp.survey_id,
        sp.system_user_id,
        su.record_end_date;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    return result;
  }

  async getSurveyParticipants(surveyId: number): Promise<object[]> {
    const sqlStatement = SQL`
      SELECT
        sp.survey_participation_id,
        sp.survey_id,
        sp.system_user_id,
        sp.survey_job_id,
        sj.name survey_job_name,
        su.user_identifier,
        su.user_guid,
        su.user_identity_source_id,
        uis.name user_identity_source_name
      FROM
        survey_participation sp
      LEFT JOIN
        system_user su
      ON
        sp.system_user_id = su.system_user_id
      LEFT JOIN
        user_identity_source uis
      ON
        su.user_identity_source_id = uis.user_identity_source_id
      LEFT JOIN
        survey_job sj
      ON
        sj.survey_job_id = sp.survey_job_id
      WHERE
        sp.survey_id = ${surveyId};
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    const result = (response && response.rows) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to get project team members', [
        'SurveyParticipationRepository->getSurveyParticipants',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return result;
  }

  async addSurveyParticipant(surveyId: number, systemUserId: number, surveyJobId: number): Promise<void> {
    const sqlStatement = SQL`
      INSERT INTO survey_participation (
        survey_id,
        system_user_id,
        survey_job_id
      ) VALUES (
        ${surveyId},
        ${systemUserId},
        ${surveyJobId}
      )
      RETURNING
        *;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert project team member', [
        'SurveyParticipationRepository->addSurveyParticipant',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  async insertSurveyParticipantRole(surveyId: number, surveyJobRole: string): Promise<void> {
    const systemUserId = this.connection.systemUserId();

    if (!systemUserId) {
      throw new ApiExecuteSQLError('Failed to identify system user ID');
    }

    const sqlStatement = SQL`
      INSERT INTO survey_participation (
        survey_id,
        system_user_id,
        survey_job_id
      )
      (
        SELECT
          ${surveyId},
          ${systemUserId},
          survey_job_id
        FROM
          survey_job
        WHERE
          name = ${surveyJobRole}
      )
      RETURNING
        *;
    `;

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new ApiExecuteSQLError('Failed to insert project team member', [
        'SurveyParticipationRepository->insertSurveyParticipantRole',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }
}
