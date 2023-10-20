import SQL from 'sql-template-strings';
import { MESSAGE_CLASS_NAME, SUMMARY_SUBMISSION_MESSAGE_TYPE } from '../constants/status';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
import { HTTP400 } from '../errors/http-error';
import { PostSummaryDetails } from '../models/summaryresults-create';
import { getLogger } from '../utils/logger';
import { MessageError, SummarySubmissionError } from '../utils/submission-error';
import { BaseRepository } from './base-repository';

export interface ISummaryTemplateSpeciesData {
  summary_template_species_id: number;
  summary_template_id: number;
  wldtaxonomic_units_id: number | null;
  validation: string;
  create_user: number;
  update_date: string | null;
  update_user: number | null;
  revision_count: number;
}

export interface ISurveySummaryDetails {
  survey_summary_submission_id: number;
  key: string;
  uuid: string;
  file_name: string;
  delete_timestamp: string | null;
  submission_message_type_id: number;
  message: string;
  submission_message_type_name: string;
  summary_submission_message_class_id: number;
  submission_message_class_name: MESSAGE_CLASS_NAME;
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

const defaultLog = getLogger('repositories/summary-repository');

export class SummaryRepository extends BaseRepository {
  /**
   * Query to find the record for a single summary submission by summarySubmissionId.
   *
   * @param {number} summarySubmissionId
   * @returns {Promise<ISummarySubmissionResponse>} The summary submission record
   */
  async findSummarySubmissionById(summarySubmissionId: number): Promise<ISummarySubmissionResponse> {
    const sqlStatement = SQL`
      SELECT
        *
      FROM
        survey_summary_submission sss
      WHERE
        sss.survey_summary_submission_id = ${summarySubmissionId}
    `;

    const response = await this.connection.sql<ISummarySubmissionResponse>(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to query survey summary submission table');
    }

    return response?.rows[0];
  }

  /**
   * Finds the latest summary submission for a given survey.
   *
   * @param {number} surveyId the ID of the survey
   * @returns {{Promise<ISurveySummaryDetails | undefined>}} the latest survey summary record for the given survey or nothing
   */
  async getLatestSurveySummarySubmission(surveyId: number): Promise<ISurveySummaryDetails | undefined> {
    const sqlStatement = SQL`
      SELECT
        sss.survey_summary_submission_id,
        sss.key,
        sss.file_name,
        sss.uuid,
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
      AND
        sss.delete_timestamp IS NULL
      ORDER BY
        sss.event_timestamp DESC, sssm.event_timestamp DESC
      LIMIT 1;
    `;

    const response = await this.connection.sql<ISurveySummaryDetails>(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to query survey summary submission table');
    }

    return response?.rows[0];
  }

  /**
   * Updates a survey summary submission record with an S3 key.
   *
   * @param {number} summarySubmissionId the ID of the record to update
   * @param {string} key S3 key
   * @return {Promise<{ survey_summary_submission_id: number }>} The ID of the updated record
   */
  async updateSurveySummarySubmissionWithKey(
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

    const response = await this.connection.sql<{ survey_summary_submission_id: number }>(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to update survey summary submission record');
    }

    return response?.rows[0];
  }

  /**
   * Inserts a survey summary submission record.
   *
   * @param {number} surveyId the ID of the survey.
   * @param {string} source the source of the record.
   * @param {string} file_name the file name of the submission.
   * @return {Promise<{ survey_summary_submission_id: number }>} the ID of the inserted record.
   */
  async insertSurveySummarySubmission(
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

    const response = await this.connection.sql<{ survey_summary_submission_id: number }>(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to insert survey summary submission record');
    }

    return response?.rows[0];
  }

  /**
   * Inserts a record for survey summary details.
   *
   * @param {number} summarySubmissionId the ID of the summary submission
   * @param {string} summaryDetails the details being inserted
   * @return {Promise<{ survey_summary_detail_id: number }>} the ID of the details record.
   */
  async insertSurveySummaryDetails(
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

    const response = await this.connection.sql<{ survey_summary_detail_id: number }>(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to insert summary details data');
    }

    return response?.rows[0];
  }

  /**
   * Soft deletes a summary submission entry by ID
   *
   * @param {number} summarySubmissionId the ID of the summary submission
   * @returns {Promise<number | null>} row count if delete is successful, null otherwise.
   */
  async deleteSummarySubmission(summarySubmissionId: number): Promise<number | null> {
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

    const response = await this.connection.sql<{ delete_timestamp: string }>(sqlStatement);

    if (!response?.rows[0]?.delete_timestamp) {
      throw new HTTP400('Failed to soft delete survey summary submission');
    }

    return response?.rowCount || null;
  }

  /**
   * Retrieves the list of messages for a summary submission.
   *
   * @param {number} summarySubmissionId the ID of the summary submission.
   * @returns {Promise<ISummarySubmissionMessagesResponse[]>} all messages for the given summary submission.
   */
  async getSummarySubmissionMessages(summarySubmissionId: number): Promise<ISummarySubmissionMessagesResponse[]> {
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

    const response = await this.connection.sql<ISummarySubmissionMessagesResponse>(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to query survey summary submission table');
    }

    return response?.rows;
  }

  /**
   * Retrieves the ID of a summary template based on its name and version number.
   * @param templateName
   * @param templateVersion
   * @returns
   */
  async getSummaryTemplateIdFromNameVersion(
    templateName: string,
    templateVersion: string
  ): Promise<{ summary_template_id: number }> {
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

    const response = await this.connection.sql<{ summary_template_id: number }>(sqlStatement);

    if (!response) {
      throw new HTTP400('Failed to query summary templates table');
    }

    return response?.rows[0];
  }

  /**
   * Retrieves all summary template species records that are constrained by the given
   * template name, version and survey focal species.
   * @param {number} templateName The name of the template.
   * @param {number} templateVersion The version of the template.
   * @param {number} [species] the wild taxonomic species code.
   * @returns {ISummaryTemplateSpeciesData[]}
   */
  async getSummaryTemplateSpeciesRecords(
    templateName: string,
    templateVersion: string,
    species?: number[]
  ): Promise<ISummaryTemplateSpeciesData[]> {
    const templateRow = await this.getSummaryTemplateIdFromNameVersion(templateName, templateVersion);

    const failedToFindValidationRulesError = new SummarySubmissionError({
      messages: [
        new MessageError(
          SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES,
          `Could not find any validation schema associated with Template Name "${templateName}" and Template Version "${templateVersion}".`
        )
      ]
    });

    if (!templateRow) {
      throw failedToFindValidationRulesError;
    }

    const queryBuilder = getKnex()
      .select()
      .fromRaw('summary_template_species sts')
      .where('sts.summary_template_id', templateRow.summary_template_id)
      .andWhere((qb) => {
        qb.whereIn('sts.wldtaxonomic_units_id', species ?? []);
      })
      .orWhere('sts.wldtaxonomic_units_id', null);

    const response = await this.connection.knex<ISummaryTemplateSpeciesData>(queryBuilder);

    if (!response) {
      throw failedToFindValidationRulesError;
    }

    // check if the species in the survey and the species on the template match
    if (species) {
      if (!response.rows.some((row) => species.includes(Number(row.wldtaxonomic_units_id)))) {
        throw new SummarySubmissionError({
          messages: [
            new MessageError(
              SUMMARY_SUBMISSION_MESSAGE_TYPE.FAILED_GET_VALIDATION_RULES,
              'The focal species imported from this template does not match the focal species selected for this survey.'
            )
          ]
        });
      }
    }

    return response.rows;
  }

  /**
   * Insert a record into the survey_summary_submission_message table.
   * @param summarySubmissionId the ID of the summary submission record.
   * @param summarySubmissionMessageType the message type.
   * @param summarySubmissionMessage the full message.
   */
  async insertSummarySubmissionMessage(
    summarySubmissionId: number,
    summarySubmissionMessageType: SUMMARY_SUBMISSION_MESSAGE_TYPE,
    summarySubmissionMessage: string
  ): Promise<void> {
    defaultLog.debug({
      label: 'insertSummarySubmissionMessage',
      summarySubmissionId,
      summarySubmissionMessageType,
      summarySubmissionMessage
    });
    const sqlStatement = SQL`
      INSERT INTO survey_summary_submission_message (
        survey_summary_submission_id,
        submission_message_type_id,
        event_timestamp,
        message
      ) VALUES (
        ${summarySubmissionId},
        (
          SELECT
            submission_message_type_id
          FROM
            summary_submission_message_type
          WHERE
            name = ${summarySubmissionMessageType}
        ),
        now(),
        ${summarySubmissionMessage}
      )
      RETURNING
        submission_message_id;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (response.rowCount !== 1) {
      throw new ApiExecuteSQLError('Failed to insert summary submission message record', [
        'ErrorRepository->insertSummarySubmissionMessage',
        'rowCount was null or undefined, expected rowCount = 1'
      ]);
    }
  }
}
