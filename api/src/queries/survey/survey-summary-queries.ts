import { PostSummaryDetails } from '../../models/summaryresults-create';
import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-summary-queries');

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
  defaultLog.debug({
    label: 'insertSurveySummarySubmissionSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId || !source || !file_name) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
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

  defaultLog.debug({
    label: 'insertSurveySummaryResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get latest summary submission for a survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getLatestSurveySummarySubmissionSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getLatestSurveySummaryResultsSQL',
    message: 'params',
    surveyId
  });

  if (!surveyId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      sss.survey_summary_submission_id as id,
		  sss.key,
		  sss.file_name
    FROM
      survey_summary_submission as sss
    LEFT OUTER JOIN
      survey_summary_detail as ssd
    ON
      sss.survey_summary_submission_id = ssd.survey_summary_submission_id
    LEFT OUTER JOIN
      survey_summary_submission_message sssm
    ON
      sss.survey_summary_submission_id = sssm.survey_summary_submission_id
    WHERE
      sss.survey_id = ${surveyId}
    AND
      sss.delete_timestamp is NULL
    ORDER BY
      sss.survey_summary_submission_id DESC
    LIMIT 1;
    `;

  defaultLog.debug({
    label: 'getLatestSurveySummaryResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to soft delete the summary submission entry by ID
 *
 * @param {number} summarySubmissionId
 * @returns {SQLStatement} sql query object
 */
export const deleteSummarySubmissionSQL = (summarySubmissionId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteSummarySubmissionSQL',
    message: 'params',
    summarySubmissionId
  });

  if (!summarySubmissionId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE survey_summary_submission
    SET delete_timestamp = now()
    WHERE survey_summary_submission_id = ${summarySubmissionId};
  `;

  defaultLog.debug({
    label: 'deleteSummarySubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
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
  defaultLog.debug({
    label: 'updateSurveySummarySubmissionWithKeySQL',
    message: 'params',
    summarySubmissionId,
    key
  });

  if (!summarySubmissionId || !key) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE survey_summary_submission
    SET
      key=  ${key}
    WHERE
      survey_summary_submission_id = ${summarySubmissionId}
    RETURNING survey_summary_submission_id as id;
  `;

  defaultLog.debug({
    label: 'updateSurveySummarySubmissionWithKeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get the record for a single summary submission.
 *
 * @param {number} submissionId
 * @returns {SQLStatement} sql query object
 */
export const getSurveySummarySubmissionSQL = (summarySubmissionId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveySummarySubmissionSQL', message: 'params', summarySubmissionId });

  if (!summarySubmissionId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      *
    FROM
      survey_summary_submission
    WHERE
      survey_summary_submission_id = ${summarySubmissionId};
  `;

  defaultLog.debug({
    label: 'getSurveySummarySubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
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
  defaultLog.debug({
    label: 'insertSurveySummarySubmissionSQL',
    message: 'params',
    summarySubmissionId
  });

  if (!summarySubmissionId || !summaryDetails) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_summary_detail (
      survey_summary_submission_id,
      study_area_id,
      parameter,
      stratum,
      parameter_value,
      parameter_estimate,
      confidence_limit_lower,
      confidence_limit_upper,
      confidence_level_percent,
      sightability_model,
      standard_error,
      coefficient_variation,
      area,
      area_flown,
      outlier_blocks_removed,
      analysis_method
    ) VALUES (
      ${summarySubmissionId},
      ${summaryDetails.study_area_id},
      ${summaryDetails.parameter},
      ${summaryDetails.stratum},
      ${summaryDetails.parameter_value},
      ${summaryDetails.parameter_estimate},
      ${summaryDetails.confidence_limit_lower},
      ${summaryDetails.confidence_limit_upper},
      ${summaryDetails.confidence_level_percent},
      ${summaryDetails.sightability_model},
      ${summaryDetails.standard_error},
      ${summaryDetails.coefficient_variation},
      ${summaryDetails.area},
      ${summaryDetails.area_flown},
      ${summaryDetails.outlier_blocks_removed},
      ${summaryDetails.analysis_method}
    )
    RETURNING survey_summary_detail_id as id;
  `;

  defaultLog.debug({
    label: 'insertSurveySummaryResultsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert the occurrence submission message.
 *
 * @param {number} occurrenceSubmissionId
 * @param {string} submissionStatusType
 * @param {string} submissionMessage
 * @returns {SQLStatement} sql query object
 */
export const insertSurveySummarySubmissionMessageSQL = (
  summarySubmissionId: number,
  summarySubmissionMessageType: string,
  summarySubmissionMessage: string,
  errorCode: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'insertSurveySummarySubmissionMessageSQL',
    message: 'params',
    summarySubmissionId,
    summarySubmissionMessageType,
    summarySubmissionMessage,
    errorCode
  });

  if (!summarySubmissionId || !summarySubmissionMessageType || !summarySubmissionMessage || !errorCode) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
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
          name = ${errorCode}
      ),
      now(),
      ${summarySubmissionMessage}
    )
    RETURNING
      submission_message_id;
  `;

  defaultLog.debug({
    label: 'insertSurveySummarySubmissionMessageSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
