import { SQL, SQLStatement } from 'sql-template-strings';
import { PostSummaryDetails } from '../../models/summaryresults-create';

/**
 * SQL query to insert a survey summary submission row.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} file_name
 * @return {*}  {(SQLStatement | null)}
 */
export const insertSurveySummarySubmissionSQL = (
  surveyId: number,
  source: string,
  file_name: string
): SQLStatement | null => {
  if (!surveyId || !source || !file_name) {
    return null;
  }

  return SQL`
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
    RETURNING survey_summary_submission_id as id;
  `;
};

/**
 * SQL query to soft delete the summary submission entry by ID
 *
 * @param {number} summarySubmissionId
 * @returns {SQLStatement} sql query object
 */
export const deleteSummarySubmissionSQL = (summarySubmissionId: number): SQLStatement | null => {
  if (!summarySubmissionId) {
    return null;
  }

  return SQL`
    UPDATE survey_summary_submission
    SET delete_timestamp = now()
    WHERE survey_summary_submission_id = ${summarySubmissionId};
  `;
};

/**
 * SQL query to insert a survey summary submission row.
 *
 * @param {number} summarySubmissionId
 * @param {string} key
 * @return {*}  {(SQLStatement | null)}
 */
export const updateSurveySummarySubmissionWithKeySQL = (
  summarySubmissionId: number,
  key: string
): SQLStatement | null => {
  if (!summarySubmissionId || !key) {
    return null;
  }

  return SQL`
    UPDATE survey_summary_submission
    SET
      key=  ${key}
    WHERE
      survey_summary_submission_id = ${summarySubmissionId}
    RETURNING survey_summary_submission_id as id;
  `;
};

/**
 * SQL query to get the record for a single summary submission.
 *
 * @param {number} submissionId
 * @returns {SQLStatement} sql query object
 */
export const getSurveySummarySubmissionSQL = (summarySubmissionId: number): SQLStatement | null => {
  if (!summarySubmissionId) {
    return null;
  }

  return SQL`
    SELECT
      *
    FROM
      survey_summary_submission
    WHERE
      survey_summary_submission_id = ${summarySubmissionId};
  `;
};

/**
 * SQL query to insert a survey summary submission row.
 *
 * @param {number} summarySubmissionId
 * @param {string} summaryDetails
 * @return {*}  {(SQLStatement | null)}
 */
export const insertSurveySummaryDetailsSQL = (
  summarySubmissionId: number,
  summaryDetails: PostSummaryDetails
): SQLStatement | null => {
  if (!summarySubmissionId || !summaryDetails) {
    return null;
  }

  return SQL`
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
    RETURNING survey_summary_detail_id as id;
  `;
};

/**
 * SQL query to get the list of messages for an summary submission.
 *
 * @param {number} summarySubmissionId
 * @returns {SQLStatement} sql query object
 */
export const getSummarySubmissionMessagesSQL = (summarySubmissionId: number): SQLStatement | null => {
  if (!summarySubmissionId) {
    return null;
  }

  return SQL`
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
};
