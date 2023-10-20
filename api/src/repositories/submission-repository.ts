import SQL from 'sql-template-strings';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { SubmissionErrorFromMessageType } from '../utils/submission-error';
import { BaseRepository } from './base-repository';

export class SubmissionRepository extends BaseRepository {
  /**
   * Insert a record into the submission_status table.
   *
   * @param {number} occurrenceSubmissionId
   * @param {string} submissionStatusType
   * @return {*}  {Promise<number>}
   */
  async insertSubmissionStatus(occurrenceSubmissionId: number, submissionStatusType: string): Promise<number> {
    const sqlStatement = SQL`
      INSERT INTO submission_status (
        occurrence_submission_id,
        submission_status_type_id,
        event_timestamp
      ) VALUES (
        ${occurrenceSubmissionId},
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
        submission_status_id as id;
    `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result || !result.id) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
    }

    return result.id;
  }
}
