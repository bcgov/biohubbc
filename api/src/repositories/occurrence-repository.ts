import SQL from 'sql-template-strings';
import { SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { HTTP400 } from '../errors/http-error';
import { PostOccurrence } from '../models/occurrence-create';
import { queries } from '../queries/queries';
import { SubmissionErrorFromMessageType } from '../utils/submission-error';
import { BaseRepository } from './base-repository';

export interface IOccurrenceSubmission {
  occurrence_submission_id: number;
  survey_id: number;
  template_methodology_species_id: number;
  source: string;
  input_key: string;
  input_file_name: string;
  output_key: string;
  output_file_name: string;
}

export class OccurrenceRepository extends BaseRepository {
  async updateDWCSourceForOccurrenceSubmission(submissionId: number, jsonData: string): Promise<number> {
    try {
      const sql = SQL`
      UPDATE
        occurrence_submission
      SET
        darwin_core_source = ${jsonData}
      WHERE
        occurrence_submission_id = ${submissionId}
      RETURNING
        occurrence_submission_id;
    `;
      const response = await this.connection.sql<{ occurrence_submission_id: number }>(sql);

      if (!response.rowCount) {
        throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
      }
      return response.rows[0].occurrence_submission_id;
    } catch (error) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
    }
  }

  /**
   * Gets an `occurrence_submission` for an id or null if nothing is found
   *
   * @param {number} submissionId
   * @return {*}  {Promise<IOccurrenceSubmission | null>}
   */
  async getOccurrenceSubmission(submissionId: number): Promise<IOccurrenceSubmission> {
    let response: IOccurrenceSubmission | null = null;
    const sql = queries.survey.getSurveyOccurrenceSubmissionSQL(submissionId);

    if (sql) {
      response = (await this.connection.query<IOccurrenceSubmission>(sql.text, sql.values)).rows[0];
    }

    if (!response) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_GET_OCCURRENCE);
    }
    return response;
  }

  /**
   * Upload scraped occurrence data.
   *
   * @param {number} occurrenceSubmissionId
   * @param {any} scrapedOccurrence
   */
  async insertPostOccurrences(occurrenceSubmissionId: number, scrapedOccurrence: PostOccurrence): Promise<any> {
    const sqlStatement = queries.occurrence.postOccurrenceSQL(occurrenceSubmissionId, scrapedOccurrence);

    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL post statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rowCount) {
      throw new HTTP400('Failed to insert occurrence data');
    }

    return response.rows[0];
  }

  /**
   * Gets a list of `occurrence` for a `occurrence_submission` id.
   *
   * @param {number} submissionId
   * @return {*}  {Promise<any[]>}
   */
  async getOccurrencesForView(submissionId: number): Promise<any[]> {
    const sqlStatement = queries.occurrence.getOccurrencesForViewSQL(submissionId);
    if (!sqlStatement) {
      throw new HTTP400('Failed to build SQL get occurrences for view statement');
    }

    const response = await this.connection.query(sqlStatement.text, sqlStatement.values);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get occurrences view data');
    }
    return response.rows;
  }

  /**
   * Update existing `occurrence_submission` record with outputKey and outputFileName.
   *
   * @param {number} submissionId
   * @param {string} outputFileName
   * @param {string} outputKey
   * @return {*}  {Promise<any>}
   */
  async updateSurveyOccurrenceSubmissionWithOutputKey(
    submissionId: number,
    outputFileName: string,
    outputKey: string
  ): Promise<any> {
    const updateSqlStatement = queries.survey.updateSurveyOccurrenceSubmissionSQL({
      submissionId,
      outputFileName,
      outputKey
    });

    if (!updateSqlStatement) {
      throw new HTTP400('Failed to build SQL update statement');
    }

    const updateResponse = await await this.connection.query(updateSqlStatement.text, updateSqlStatement.values);

    if (!updateResponse || !updateResponse.rowCount) {
      throw SubmissionErrorFromMessageType(SUBMISSION_MESSAGE_TYPE.FAILED_UPDATE_OCCURRENCE_SUBMISSION);
    }

    return updateResponse.rows[0];
  }
}
