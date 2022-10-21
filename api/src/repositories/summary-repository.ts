import SQL from 'sql-template-strings';
import { MESSAGE_CLASS_NAME } from '../constants/status';
import { HTTP400 } from '../errors/http-error';
import { PostSummaryDetails } from '../models/summaryresults-create';
import { BaseRepository } from './base-repository';

export interface ISummaryTemplateSpeciesData {
  summary_template_species_id: number;
  validation: string;
}

export interface ISurveySummaryDetails {
  id: number;
  key: string;
  file_name: string;
  delete_timestamp: string | null;
  submission_message_type_id: number;
  message: string
  submission_message_type_name: string;
  summary_submission_message_class_id: number;
  submission_message_class_name: MESSAGE_CLASS_NAME
}

export interface ISummarySubmissionResponse {
  survey_summary_submission_id: number;
  survey_id: number;
  source: string;
  event_timestamp: string | null;
  delete_timestamp: string | null;
  key: string;
  file_name: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
  summary_template_species_id: number | null;
}

export interface ISummarySubmissionMessagesResponse {
  id: number;
  class: string;
  type: string;
  message: string;
}

export class SummaryRepository extends BaseRepository {
  /**
   * Query to get the record for a single summary submission.
   *
   * @param {number} surveyId
   * @returns {SQLStatement} sql query object
   */
   async findSummarySubmissionById (summarySubmissionId: number): Promise<ISummarySubmissionResponse> {
    const sqlStatement = SQL`
      SELECT
        *
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
   * @returns {*} {Promise<ISurveySummaryDetails>}
   */
  async getLatestSurveySummarySubmission(surveyId: number): Promise<ISurveySummaryDetails> {
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
   * Query to insert a survey summary submission row.
   * 
   * @param {number} summarySubmissionId
   * @param {string} key
   * @return {*}  {Promise<{ survey_summary_submission_id: number }>}
   */
  async updateSurveySummarySubmissionWithKey (
    summarySubmissionId: number,
    key: string
  ): Promise<{ survey_summary_submission_id: number }> {
    const sqlStatement = SQL`
      UPDATE survey_summary_submission
      SET
        key = ${key}
      WHERE
        survey_summary_submission_id = ${summarySubmissionId}
      RETURNING survey_summary_submission_id;
    `;

    const response = await this.connection.query<{ survey_summary_submission_id: number }>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to update survey summary submission record');
    }

    return response && response.rows && response.rows[0];
  };

  /**
   * Query to insert a survey summary submission row.
   *
   * @param {number} surveyId
   * @param {string} source
   * @param {string} file_name
   * @return {*}  {Promise<{ survey_summary_submission_id: number }>}
   */
  async insertSurveySummarySubmission (
    surveyId: number,
    source: string,
    file_name: string
  ): Promise<{ survey_summary_submission_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO survey_summary_submission (
        survey_id,
        source,
        file_name,
        event_timestamp
      ) VALUES (
        ${surveyId},
        ${source},
        ${file_name},
        now()
      )
      RETURNING survey_summary_submission_id;
    `;

    const response = await this.connection.query<{ survey_summary_submission_id: number }>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to insert survey summary submission record');
    }

    return response && response.rows && response.rows[0];
  };

  /**
   * Query to insert a survey summary submission row.
   *
   * @param {number} summarySubmissionId
   * @param {string} summaryDetails
   * @return {*}  {Promise<{ survey_summary_detail_id: number }>}
   */
  async insertSurveySummaryDetails (
    summarySubmissionId: number,
    summaryDetails: PostSummaryDetails
  ): Promise<{ survey_summary_detail_id: number }> {
    const sqlStatement = SQL`
      INSERT INTO survey_summary_detail (
        survey_summary_submission_id,
        study_area_id,
        population_unit,
        block_sample_unit_id, 
        parameter,
        stratum,
        observed,
        estimated,
        sightability_model,
        sightability_correction,
        standard_error,
        coefficient_variation,
        confidence_level_percent,
        confidence_limit_lower,
        confidence_limit_upper,
        total_area_surveyed_sqm,
        area_flown,
        total_kilometers_surveyed,
        best_parameter_flag,
        outlier_blocks_removed,
        total_marked_animals_observed,
        marked_animals_available,
        parameter_comments
      ) VALUES (
        ${summarySubmissionId},
        ${summaryDetails.study_area_id},
        ${summaryDetails.population_unit},
        ${summaryDetails.block_sample_unit_id},
        ${summaryDetails.parameter},
        ${summaryDetails.stratum},
        ${summaryDetails.observed},
        ${summaryDetails.estimated},
        ${summaryDetails.sightability_model},
        ${summaryDetails.sightability_correction_factor},
        ${summaryDetails.standard_error},
        ${summaryDetails.coefficient_variation},
        ${summaryDetails.confidence_level_percent},
        ${summaryDetails.confidence_limit_lower},
        ${summaryDetails.confidence_limit_upper},
        ${summaryDetails.total_area_survey_sqm},
        ${summaryDetails.area_flown},
        ${summaryDetails.total_kilometers_surveyed},
        ${summaryDetails.best_parameter_flag},
        ${summaryDetails.outlier_blocks_removed},
        ${summaryDetails.total_marked_animals_observed},
        ${summaryDetails.marked_animals_available},
        ${summaryDetails.parameter_comments}
      )
      RETURNING survey_summary_detail_id;
    `;

    const response = await this.connection.query<{ survey_summary_detail_id: number }>(sqlStatement.text, sqlStatement.values);

    if (!response) {
      throw new HTTP400('Failed to insert summary details data');
    }

    return response && response.rows && response.rows[0];
  };

  /**
   * Query to soft delete the summary submission entry by ID
   *
   * @param {number} summarySubmissionId
   * @returns {*} {{ delete_timestamp: string }}
   */
  async deleteSummarySubmission(summarySubmissionId: number): Promise<{ delete_timestamp: string }> {
    const sqlStatement = SQL`
      UPDATE
        survey_summary_submission
      SET
        delete_timestamp = now()
      WHERE
        survey_summary_submission_id = ${summarySubmissionId}
      RETURNING
        delete_timestamp;
    `;

    const response = await this.connection.query<{ delete_timestamp: string }>(sqlStatement.text, sqlStatement.values);

    if (!response || !response?.rows[0]?.delete_timestamp) {
      throw new HTTP400('Failed to soft delete survey summary submission');
    }

    return response && response.rows && response.rows[0];
  };

/**
 * Query to get the list of messages for a summary submission.
 *
 * @param {number} summarySubmissionId
 * @returns {*} {Promise<ISummarySubmissionMessagesResponse[]>}
 */
 async getSummarySubmissionMessages (
  summarySubmissionId: number
): Promise<ISummarySubmissionMessagesResponse[]> {
  const sqlStatement = SQL`
    SELECT
      sssm.submission_message_id as id,
      sssm.message,
      ssmt.name as type,
      ssmc.name as class
    FROM
      survey_summary_submission as sss
    LEFT OUTER JOIN
      survey_summary_submission_message as sssm
    ON
      sssm.survey_summary_submission_id = sss.survey_summary_submission_id
    LEFT OUTER JOIN
      summary_submission_message_type as ssmt
    ON
      ssmt.submission_message_type_id = sssm.submission_message_type_id
    LEFT OUTER JOIN
      summary_submission_message_class as ssmc
    ON
      ssmc.summary_submission_message_class_id = ssmt.summary_submission_message_class_id
    WHERE
      sss.survey_summary_submission_id = ${summarySubmissionId}
    ORDER BY
      sssm.submission_message_id;
    `;

    const response = await this.connection.query<ISummarySubmissionMessagesResponse>(sqlStatement.text, sqlStatement.values);

    return response && response.rows
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
   * @TODO should we use "template" language? Is this not just a submission?
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
