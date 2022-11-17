import SQL from 'sql-template-strings';
import { SUBMISSION_MESSAGE_TYPE, SUBMISSION_STATUS_TYPE } from '../constants/status';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing permit data.
 *
 * @export
 * @class PermitRepository
 * @extends {BaseRepository}
 */
export class ErrorRepository extends BaseRepository {
  /**
   * Insert a new submission status record.
   *
   * @param {number} submissionId
   * @param {SUBMISSION_STATUS_TYPE} submissionStatusType
   * @return {*}  {Promise<{ submission_status_id: number; submission_status_type_id: number }>}
   * @memberof SubmissionRepository
   */
  async insertSubmissionStatus(
    submissionId: number,
    submissionStatusType: SUBMISSION_STATUS_TYPE
  ): Promise<{ submission_status_id: number; submission_status_type_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO submission_status (
        occurrence_submission_id,
        submission_status_type_id,
        event_timestamp
      ) VALUES (
        ${submissionId},
        (
          SELECT
            submission_status_type_id
          FROM
            submission_status_type
          WHERE
            name = ${submissionStatusType}
        ),
        now()
      )
      RETURNING
        submission_status_id,
        submission_status_type_id;
    `;

    const response = await this.connection.sql<{ submission_status_id: number; submission_status_type_id: number }>(
      sqlStatement
    );

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert submission status record', [
        'ErrorRepository->insertSubmissionStatus',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Insert a submission message record.
   *
   * @param {number} submissionStatusId
   * @param {SUBMISSION_MESSAGE_TYPE} submissionMessageType
   * @return {*}  {Promise<{ submission_message_id: number; submission_message_type_id: number }>}
   * @memberof SubmissionRepository
   */
  async insertSubmissionMessage(
    submissionStatusId: number,
    submissionMessageType: SUBMISSION_MESSAGE_TYPE,
    submissionMessage: string
  ): Promise<{ submission_message_id: number; submission_message_type_id: number }> {
    const sqlStatement = SQL`
        INSERT INTO submission_message (
          submission_status_id,
          submission_message_type_id,         
          event_timestamp,
          message
        ) VALUES (
          ${submissionStatusId},
          (
            SELECT
              submission_message_type_id
            FROM
              submission_message_type
            WHERE
              name = ${submissionMessageType}
          ),
          now(),
          ${submissionMessage}
        )
        RETURNING
          submission_message_id,
          submission_message_type_id;
      `;

    const response = await this.connection.sql<{ submission_message_id: number; submission_message_type_id: number }>(
      sqlStatement
    );

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert submission message record', [
        'ErrorRepository->insertSubmissionMessage',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }

    return response.rows[0];
  }
}
