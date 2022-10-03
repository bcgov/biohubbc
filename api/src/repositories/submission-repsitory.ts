import { HTTP400 } from "../errors/custom-error";
import { queries } from "../queries/queries";
import { BaseRepository } from "./base-repository";

export class SubmissionRepository extends BaseRepository {

  /**
 * Insert a record into the submission_status table.
 *
 * @param {number} occurrenceSubmissionId
 * @param {string} submissionStatusType
 * @return {*}  {Promise<number>}
 */
insertSubmissionStatus = async (
  occurrenceSubmissionId: number,
  submissionStatusType: string
): Promise<number> => {
  const sqlStatement = queries.survey.insertOccurrenceSubmissionStatusSQL(occurrenceSubmissionId, submissionStatusType);

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

  const result = (response && response.rows && response.rows[0]) || null;

  if (!result || !result.id) {
    throw new HTTP400('Failed to insert survey submission status data');
  }

  return result.id;
};

/**
 * Insert a record into the submission_message table.
 *
 * @param {number} submissionStatusId
 * @param {string} submissionMessageType
 * @param {string} message
 * @return {*}  {Promise<void>}
 */
 insertSubmissionMessage = async(
  submissionStatusId: number,
  submissionMessageType: string,
  message: string,
  errorCode: string
): Promise<void> => {
  const sqlStatement = queries.survey.insertOccurrenceSubmissionMessageSQL(
    submissionStatusId,
    submissionMessageType,
    message,
    errorCode
  );

  if (!sqlStatement) {
    throw new HTTP400('Failed to build SQL insert statement');
  }

  const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

  if (!response || !response.rowCount) {
    throw new HTTP400('Failed to insert survey submission message data');
  }
};



}