import { HTTP400 } from '../errors/custom-error';
import { PostOccurrence } from '../models/occurrence-create';
import { queries } from '../queries/queries';
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

  /**
   * Gets an `occurrence_submission` for an id or null if nothing is found
   *
   * @param {number} submissionId
   * @return {*}  {Promise<IOccurrenceSubmission | null>}
   */
  async getOccurrenceSubmission(submissionId: number): Promise<IOccurrenceSubmission | null> {
    let response: IOccurrenceSubmission | null = null;
    const sql = queries.survey.getSurveyOccurrenceSubmissionSQL(submissionId);

    if (sql) {
      response = (await this.connection.query<IOccurrenceSubmission>(sql.text, sql.values)).rows[0];
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

    const updateResponse = await (await this.connection.query(updateSqlStatement.text, updateSqlStatement.values));

    if (!updateResponse || !updateResponse.rowCount) {
      throw new HTTP400('Failed to update survey occurrence submission record');
    }

    return updateResponse.rows[0];
  }
}
