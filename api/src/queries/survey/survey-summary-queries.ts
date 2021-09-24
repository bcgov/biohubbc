import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-summary-queries');

/**
 * SQL query to insert a survey occurrence submission row.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} key
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

  if (!surveyId) {
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
 * SQL query to get latest occurrence submission for a survey.
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
      sss.survey_summary_submission_id,
		  sss.key,
		  sss.file_name,
      sss.delete_timestamp,
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
 * SQL query to insert a survey occurrence submission row.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} key
 * @return {*}  {(SQLStatement | null)}
 */
// export const updateSurveyOccurrenceSubmissionWithKeySQL = (submissionId: number, key: string): SQLStatement | null => {
//   defaultLog.debug({
//     label: 'uodateSurveyOccurrenceSubmissionWithKeySQL',
//     message: 'params',
//     submissionId,
//     key
//   });

//   if (!submissionId || !key) {
//     return null;
//   }

//   const sqlStatement: SQLStatement = SQL`
//     UPDATE occurrence_submission
//     SET
//       key=  ${key}
//     WHERE
//       occurrence_submission_id = ${submissionId}
//     RETURNING occurrence_submission_id as id;
//   `;

//   defaultLog.debug({
//     label: 'updateSurveyOccurrenceSubmissionWithKeySQL',
//     message: 'sql',
//     'sqlStatement.text': sqlStatement.text,
//     'sqlStatement.values': sqlStatement.values
//   });

//   return sqlStatement;
// };

/**
 * SQL query to delete occurrence records by occurrence submission id.
 *
 * @param {number} occurrenceSubmissionId
 * @return {*}  {(SQLStatement | null)}
 */
// export const deleteSurveyOccurrencesSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
//   defaultLog.debug({
//     label: 'deleteSurveyOccurrencesSQL',
//     message: 'params',
//     occurrenceSubmissionId
//   });

//   if (!occurrenceSubmissionId) {
//     return null;
//   }

//   const sqlStatement: SQLStatement = SQL`
//     DELETE FROM
//       occurrence
//     WHERE
//       occurrence_submission_id = ${occurrenceSubmissionId};
//   `;

//   defaultLog.debug({
//     label: 'deleteSurveyOccurrencesSQL',
//     message: 'sql',
//     'sqlStatement.text': sqlStatement.text,
//     'sqlStatement.values': sqlStatement.values
//   });

//   return sqlStatement;
// };

/**
 * SQL query to get the record for a single occurrence submission.
 *
 * @param {number} submissionId
 * @returns {SQLStatement} sql query object
 */
export const getSurveySummaryResultSQL = (summaryResultId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveySummaryResultSQL', message: 'params', summaryResultId });

  if (!summaryResultId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      *
    FROM
    survey_summary_general
    WHERE
    survey_summary_general_id = ${summaryResultId};
  `;

  defaultLog.debug({
    label: 'getSurveySummaryResultSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to soft delete the occurrence submission entry by ID
 *
 * @param {number} occurrenceSubmissionId
 * @returns {SQLStatement} sql query object
 */
// export const deleteOccurrenceSubmissionSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
//   defaultLog.debug({
//     label: 'deleteOccurrenceSubmissionSQL',
//     message: 'params',
//     occurrenceSubmissionId
//   });

//   if (!occurrenceSubmissionId) {
//     return null;
//   }

//   const sqlStatement: SQLStatement = SQL`
//     UPDATE occurrence_submission
//     SET delete_timestamp = now()
//     WHERE occurrence_submission_id = ${occurrenceSubmissionId};
//   `;

//   defaultLog.debug({
//     label: 'deleteOccurrenceSubmissionSQL',
//     message: 'sql',
//     'sqlStatement.text': sqlStatement.text,
//     'sqlStatement.values': sqlStatement.values
//   });

//   return sqlStatement;
// };



/**
 * SQL query to insert a survey occurrence submission row.
 *
 * @param {number} surveyId
 * @param {string} source
 * @param {string} key
 * @return {*}  {(SQLStatement | null)}
 */
 export const updateSurveySummarySubmissionWithKeySQL = (
  surveySubmissionId: number,
  key: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'updateSurveySummarySubmissionWithKeySQL',
    message: 'params',
    surveySubmissionId,
    key
  });

  if (!surveySubmissionId || !key) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE survey_summary_submission
    SET
      key=  ${key}
    WHERE
      survey_summary_submission_id = ${surveySubmissionId}
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
 * SQL query to get the record for a single occurrence submission.
 *
 * @param {number} submissionId
 * @returns {SQLStatement} sql query object
 */
 export const getSurveySummaryResultsSubmissionSQL = (summarySubmissionId: number): SQLStatement | null => {
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


