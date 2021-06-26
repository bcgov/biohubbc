import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/survey/survey-attachments-queries');

/**
 * SQL query to get attachments for a single survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyAttachmentsSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveyAttachmentsSQL', message: 'params', surveyId });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      id,
      file_name,
      update_date,
      create_date,
      file_size,
      key
    from
      survey_attachment
    where
      s_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete an attachment for a single survey.
 *
 * @param {number} surveyId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyAttachmentSQL = (surveyId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteSurveyAttachmentSQL', message: 'params', surveyId });

  if (!surveyId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_attachment
    WHERE
      s_id = ${surveyId}
    AND
      id = ${attachmentId}
    RETURNING
      key;
  `;

  defaultLog.debug({
    label: 'deleteSurveyAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get S3 key of an attachment for a single survey.
 *
 * @param {number} surveyId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyAttachmentS3KeySQL = (surveyId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveyAttachmentS3KeySQL', message: 'params', surveyId });

  if (!surveyId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      key
    FROM
      survey_attachment
    WHERE
      s_id = ${surveyId}
    AND
      id = ${attachmentId};
  `;

  defaultLog.debug({
    label: 'getSurveyAttachmentS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a survey attachment row.
 *
 * @param fileName
 * @param fileSize
 * @param projectId
 * @param surveyId
 * @returns {SQLStatement} sql query object
 */
export const postSurveyAttachmentSQL = (
  fileName: string,
  fileSize: number,
  projectId: number,
  surveyId: number
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveyAttachmentSQL',
    message: 'params',
    fileName,
    fileSize,
    projectId,
    surveyId
  });

  if (!fileName || !fileSize || !projectId || !surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_attachment (
      s_id,
      file_name,
      file_size,
      key
    ) VALUES (
      ${surveyId},
      ${fileName},
      ${fileSize},
      ${projectId + '/' + surveyId + '/' + fileName}
    )
    RETURNING
      id;
  `;

  defaultLog.debug({
    label: 'postSurveyAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get an attachment for a single survey by survey id and filename.
 *
 * @param {number} surveyId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const getSurveyAttachmentByFileNameSQL = (surveyId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveyAttachmentByFileNameSQL', message: 'params', surveyId });

  if (!surveyId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      id,
      file_name,
      update_date,
      create_date,
      file_size
    from
      survey_attachment
    where
      s_id = ${surveyId}
    and
      file_name = ${fileName};
  `;

  defaultLog.debug({
    label: 'getSurveyAttachmentByFileNameSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update an attachment for a single survey by survey id and filename.
 *
 * @param {number} surveyId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const putSurveyAttachmentSQL = (surveyId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'putSurveyAttachmentSQL', message: 'params', surveyId });

  if (!surveyId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      survey_attachment
    SET
      file_name = ${fileName}
    WHERE
      file_name = ${fileName}
    AND
      s_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'putSurveyAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
