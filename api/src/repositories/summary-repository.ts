import SQL from 'sql-template-strings';
import { HTTP400 } from '../errors/http-error';
import { BaseRepository } from './base-repository';

export interface ISummaryTemplateSpeciesData {
  summary_template_species_id: number;
  validation: string;
}

export interface ISurveySummaryDetails {
  id: number
  key: string
  file_name: string
  delete_timestamp: string | null,
  // @TODO finish interface
}

export interface ISummarySubmissionResponse {
  survey_summary_submission_id: number
  input_key: string
  input_file_name: string
  delete_timestamp: string | null;
}

export class SummaryRepository extends BaseRepository {
  /**
   * Query to get latest summary submission for a survey.
   *
   * @param {number} surveyId
   * @returns {SQLStatement} sql query object
   */
   async findSummarySubmissionById (summarySubmissionId: number): Promise<ISummarySubmissionResponse> {
    const sqlStatement = SQL`
      SELECT
        sss.survey_summary_submission_id
        sss.key,
        sss.file_name,
        sss.delete_timestamp
      FROM
        survey_summary_submission sss
      WHERE
        sss.survey_summary_submission_id = ${summarySubmissionId}
    `;

    const response = await this.connection.query<ISummarySubmissionResponse>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query survey summary submission table');
    }

    return response && response.rows && response.rows[0];
  };

  /**
   * Query to get latest summary submission for a survey.
   *
   * @param {number} surveyId
   * @returns {SQLStatement} sql query object
   */
  async getLatestSurveySummarySubmission (surveyId: number): Promise<ISurveySummaryDetails> {
    const sqlStatement = SQL`
      SELECT
        sss.survey_summary_submission_id as id,
        sss.key,
        sss.file_name,
        sss.delete_timestamp,
        sssm.submission_message_type_id,
        sssm.message,
        ssmt.name as submission_message_type_name,
        ssmt.summary_submission_message_class_id,
        ssmc.name as submission_message_class_name
      FROM
        survey_summary_submission as sss
      LEFT OUTER JOIN
        survey_summary_submission_message as sssm
      ON
        sss.survey_summary_submission_id = sssm.survey_summary_submission_id
      LEFT OUTER JOIN
        summary_submission_message_type as ssmt
      ON
        sssm.submission_message_type_id = ssmt.submission_message_type_id
      LEFT OUTER JOIN
        summary_submission_message_class as ssmc
      ON
        ssmt.summary_submission_message_class_id = ssmc.summary_submission_message_class_id
      WHERE
        sss.survey_id = ${surveyId}
      ORDER BY
        sss.event_timestamp DESC
      LIMIT 1;
    `;

    const response = await this.connection.query<ISurveySummaryDetails>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query survey summary submission table');
    }

    return response && response.rows && response.rows[0];
  };

  /**
   * Retreives the ID of a summary template based on its name and version number.
   * @param templateName 
   * @param templateVersion 
   * @returns
   */
  async getSummaryTemplateIdFromNameVersion(templateName: string, templateVersion: string): Promise<{ summary_template_id: number }> {
    const sqlStatement = SQL`
      SELECT
        st.summary_template_id
      FROM
        summary_template st
      WHERE
        st.name = ${templateName}
      AND
        st.version = ${templateVersion}
      ;
    `;

    const response = await this.connection.query<{ summary_template_id: number }>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query summary templates table');
    }

    return response && response.rows && response.rows[0];
  }

  /**
   * @TODO jsdoc
   * @TODO use window function in order to conditional include the wild taxonomic units clause (specifically when
   * the species parameter isn't undefined.)
   * 
   * @param templateName 
   * @param templateVersion 
   * @returns 
   */
  async getSummaryTemplateSpeciesRecord(
    templateName: string,
    templateVersion: string,
    species: number
  ): Promise<ISummaryTemplateSpeciesData> {
    const templateRow = await this.getSummaryTemplateIdFromNameVersion(templateName, templateVersion);

    const sqlStatement = SQL`
      SELECT
        *
      FROM
        summary_template_species sts
      WHERE
        sts.summary_template_id = ${templateRow.summary_template_id}
      AND
        sts.wldtaxonomic_units_id = ${species}
      ;
    `;
    const response = await this.connection.query<ISummaryTemplateSpeciesData>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to query summary template species table');
    }

    return response && response.rows && response.rows[0];
  }
}
