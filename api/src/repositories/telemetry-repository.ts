import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/telemetry-repository');

export const Deployment = z.object({
  /**
   * SIMS deployment primary ID
   */
  deployment_id: z.number(),
  /**
   * SIMS critter primary ID
   */
  critter_id: z.number(),
  /**
   * BCTW deployment primary ID
   */
  bctw_deployment_id: z.string().uuid()
});

export type Deployment = z.infer<typeof Deployment>;

/**
 * Interface reflecting survey telemetry retrieved from the database
 */
export const TelemetrySubmissionRecord = z.object({
  survey_telemetry_submission_id: z.number(),
  survey_id: z.number(),
  key: z.string(),
  original_filename: z.string(),
  create_date: z.string(),
  create_user: z.number(),
  update_date: z.string().nullable(),
  update_user: z.number().nullable()
});

export type TelemetrySubmissionRecord = z.infer<typeof TelemetrySubmissionRecord>;

export class TelemetryRepository extends BaseRepository {
  async insertSurveyTelemetrySubmission(
    submission_id: number,
    key: string,
    survey_id: number,
    original_filename: string
  ): Promise<TelemetrySubmissionRecord> {
    defaultLog.debug({ label: 'insertSurveyTelemetrySubmission' });
    const sqlStatement = SQL`
      INSERT INTO
        survey_telemetry_submission
        (survey_telemetry_submission_id, key, survey_id, original_filename)
      VALUES
        (${submission_id}, ${key}, ${survey_id}, ${original_filename})
      RETURNING *;`;

    const response = await this.connection.sql(sqlStatement, TelemetrySubmissionRecord);

    return response.rows[0];
  }

  /**
   * Retrieves the next submission ID from the survey_telemetry_submission_id_seq sequence
   *
   * @return {*}  {Promise<number>}
   * @memberof TelemetryRepository
   */
  async getNextSubmissionId(): Promise<number> {
    const sqlStatement = SQL`
      SELECT nextval('biohub.survey_telemetry_submission_id_seq')::integer as survey_telemetry_submission;
    `;
    const response = await this.connection.sql<{ survey_telemetry_submission: number }>(sqlStatement);
    return response.rows[0].survey_telemetry_submission;
  }

  /**
   * Retrieves the telemetry submission record by the given submission ID.
   *
   * @param {number} submissionId
   * @return {*}  {Promise<TelemetrySubmissionRecord>}
   * @memberof TelemetryRepository
   */
  async getTelemetrySubmissionById(submissionId: number): Promise<TelemetrySubmissionRecord> {
    const queryBuilder = getKnex()
      .queryBuilder()
      .select('*')
      .from('survey_telemetry_submission')
      .where('survey_telemetry_submission_id', submissionId);

    const response = await this.connection.knex(queryBuilder, TelemetrySubmissionRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get telemetry submission', [
        'TelemetryRepository->getTelemetrySubmissionById',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Get deployments for the given critter ids.
   *
   * Note: SIMS does not store deployment information, beyond an ID. Deployment details must be fetched from the
   * external BCTW API.
   *
   * @param {number[]} critterIds
   * @return {*}  {Promise<Deployment[]>}
   * @memberof TelemetryRepository
   */
  async getDeploymentsByCritterIds(critterIds: number[]): Promise<Deployment[]> {
    const queryBuilder = getKnex()
      .queryBuilder()
      .select(['deployment_id', 'critter_id', 'bctw_deployment_id'])
      .from('deployment')
      .whereIn('critter_id', critterIds);

    const response = await this.connection.knex(queryBuilder, Deployment);

    return response.rows;
  }

  /**
   * Get deployments for the provided survey id.
   *
   * Note: SIMS does not store deployment information, beyond an ID. Deployment details must be fetched from the
   * external BCTW API.
   *
   * @param {number} surveyId
   * @return {*}  {Promise<Deployment[]>}
   * @memberof TelemetryRepository
   */
  async getDeploymentsBySurveyId(surveyId: number): Promise<Deployment[]> {
    const sqlStatement = SQL`
      SELECT
        deployment.deployment_id,
        deployment.critter_id,
        deployment.bctw_deployment_id
      FROM
        deployment
      LEFT JOIN
        critter
      ON
        critter.critter_id = deployment.critter_id
      WHERE
        critter.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql(sqlStatement, Deployment);

    return response.rows;
  }
}
