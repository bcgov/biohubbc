import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/dwc/dwc-queries');

/**
 * SQL query to get EML for a particular data pacakge.
 *
 * @param {number} dataPackageId
 * @param {string} suppliedTitle
 * @returns {SQLStatement} sql query object
 */
 export const getDataPackageEMLSQL = (dataPackageId: number, suppliedTitle?: string): SQLStatement | null => {
    defaultLog.debug({ label: 'getDataPackageEMLSQL', message: 'params', dataPackageId, suppliedTitle });
  
    if (!dataPackageId) {
      return null;
    }
  
    const sqlStatement: SQLStatement = SQL`SELECT api_get_eml_data_package(${dataPackageId}, ${suppliedTitle});`;
  
    defaultLog.debug({
      label: 'getSurveyOccurrenceSubmissionSQL',
      message: 'sql',
      'sqlStatement.text': sqlStatement.text,
      'sqlStatement.values': sqlStatement.values
    });
  
    return sqlStatement;
  };

/**
 * SQL query to get sumbission occurrence record given package ID for a particular survey.
 *
 * @param {number} dataPackageId
 * @returns {SQLStatement} sql query object
 */
 export const getSurveyOccurrenceSubmissionSQL = (dataPackageId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getDataPackageEMLSQL', message: 'params', dataPackageId });

  if (!dataPackageId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT 
      os.* 
    from 
      occurrence_submission os
      , occurrence_submission_data_package osdp 
    where 
      osdp.data_package_id  = ${dataPackageId}
      and os.occurrence_submission_id = osdp.occurrence_submission_id ;
  `;

  defaultLog.debug({
    label: 'getSurveyOccurrenceSubmissionSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};