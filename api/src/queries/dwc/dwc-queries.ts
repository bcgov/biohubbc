import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/dwc/dwc-queries');

// TODO: remove
/**
 * SQL query to get EML for a particular data package.
 *
 * @param {number} dataPackageId
 * @param {string} suppliedTitle
 * @returns {SQLStatement} sql query object
 */
// export const getDataPackageEMLSQL = (dataPackageId: number, suppliedTitle?: string): SQLStatement | null => {
//   defaultLog.debug({ label: 'getDataPackageEMLSQL', message: 'params', dataPackageId, suppliedTitle });

//   if (!dataPackageId) {
//     return null;
//   }

//   const sqlStatement: SQLStatement = SQL`SELECT api_get_eml_data_package(${dataPackageId}, ${suppliedTitle});`;

//   defaultLog.debug({
//     label: 'getDataPackageEMLSQL',
//     message: 'sql',
//     'sqlStatement.text': sqlStatement.text,
//     'sqlStatement.values': sqlStatement.values
//   });

//   return sqlStatement;
// };

/**
 * SQL query to get submission occurrence record given package ID for a particular survey.
 *
 * @param {number} dataPackageId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyOccurrenceSubmissionSQL = (dataPackageId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveyOccurrenceSubmissionSQL', message: 'params', dataPackageId });

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      os.* 
    from 
      occurrence_submission os
      , occurrence_submission_data_package osdp 
    where 
      osdp.data_package_id  = ${dataPackageId}
      and os.occurrence_submission_id = osdp.occurrence_submission_id;
  `;

  defaultLog.debug({
    label: 'getSurveyOccurrenceSubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get data package record given package ID.
 *
 * @param {number} dataPackageId
 * @returns {SQLStatement} sql query object
 */
export const getDataPackageSQL = (dataPackageId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getDataPackageSQL', message: 'params', dataPackageId });

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      * 
    from 
      data_package
    where 
      data_package_id  = ${dataPackageId};
  `;

  defaultLog.debug({
    label: 'getDataPackageSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get occurrence submission publish date.
 *
 * @param {number} occurrenceSubmissionId
 * @returns {SQLStatement} sql query object
 */
export const getPublishedSurveyStatusSQL = (occurrenceSubmissionId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublishedSurveyStatusSQL', message: 'params', occurrenceSubmissionId });

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      *
    from 
      survey_status
    where
      survey_status = api_get_character_system_constant('OCCURRENCE_SUBMISSION_STATE_PUBLISHED')
      and occurrence_submission_id  = ${occurrenceSubmissionId};
  `;

  defaultLog.debug({
    label: 'getPublishedSurveyStatusSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
