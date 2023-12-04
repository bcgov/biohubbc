import SQL from 'sql-template-strings';
import { z } from 'zod';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

const defaultLog = getLogger('repositories/telemetry-repository');

/**
 * Interface reflecting survey telemetry retrieved from the database
 */
export const TelemetrySubmissionRecord = z.object({
  submission_id: z.number(),
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
        (submission_id, key, survey_id, original_filename)
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
      SELECT nextval('biohub.survey_telemetry_submission_id_seq')::integer as submission_id;
    `;
    const response = await this.connection.sql<{ submission_id: number }>(sqlStatement);
    return response.rows[0].submission_id;
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
      .where('submission_id', submissionId);

    const response = await this.connection.knex(queryBuilder, TelemetrySubmissionRecord);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to get telemetry submission', [
        'TelemetryRepository->getTelemetrySubmissionById',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }
}
