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
      survey_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size,
      file_type,
      key,
      security_token,
      revision_count
    from
      survey_attachment
    where
      survey_id = ${surveyId};
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
 * SQL query to get report attachments for a single survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyReportAttachmentsSQL = (surveyId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getSurveyReportAttachmentsSQL', message: 'params', surveyId });

  if (!surveyId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      survey_report_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size,
      key,
      security_token,
      revision_count
    from
      survey_report_attachment
    where
      survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'getSurveyReportAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete an attachment for a single survey.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyAttachmentSQL = (attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteSurveyAttachmentSQL', message: 'params', attachmentId });

  if (!attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_attachment
    WHERE
      survey_attachment_id = ${attachmentId}
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
 * SQL query to delete a report attachment for a single survey.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyReportAttachmentSQL = (attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteSurveyReportAttachmentSQL', message: 'params', attachmentId });

  if (!attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from survey_report_attachment
    WHERE
      survey_report_attachment_id = ${attachmentId}
    RETURNING
      key;
  `;

  defaultLog.debug({
    label: 'deleteSurveyReportAttachmentSQL',
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
      survey_id = ${surveyId}
    AND
      survey_attachment_id = ${attachmentId};
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
 * @param {string} fileName
 * @param {number} fileSize
 * @param {string} fileType
 * @param {number} projectId
 * @param {number} surveyId
 * @param {string} key to use in s3
 * @returns {SQLStatement} sql query object
 */
export const postSurveyAttachmentSQL = (
  fileName: string,
  fileSize: number,
  fileType: string,
  projectId: number,
  surveyId: number,
  key: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveyAttachmentSQL',
    message: 'params',
    fileName,
    fileSize,
    fileType,
    projectId,
    surveyId,
    key
  });

  if (!fileName || !fileSize || !fileType || !projectId || !surveyId || !key) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_attachment (
      survey_id,
      file_name,
      file_size,
      file_type,
      key
    ) VALUES (
      ${surveyId},
      ${fileName},
      ${fileSize},
      ${fileType},
      ${key}
    )
    RETURNING
      survey_attachment_id as id;
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
 * SQL query to insert a survey report attachment row.
 *
 * @param {string} fileName
 * @param {number} fileSize
 * @param {number} projectId
 * @param {number} surveyId
 * @param {string} key to use in s3
 * @returns {SQLStatement} sql query object
 */
export const postSurveyReportAttachmentSQL = (
  fileName: string,
  fileSize: number,
  projectId: number,
  surveyId: number,
  key: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postSurveyReportAttachmentSQL',
    message: 'params',
    fileName,
    fileSize,
    projectId,
    surveyId,
    key
  });

  if (!fileName || !fileSize || !projectId || !surveyId || !key) {
    return null;
  }

  // TODO: Replace hard-coded title, year and description
  const title = 'Test Report';
  const year = '2021';
  const description = 'Test description';

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_report_attachment (
      survey_id,
      file_name,
      file_size,
      key,
      title,
      year,
      description
    ) VALUES (
      ${surveyId},
      ${fileName},
      ${fileSize},
      ${key},
      ${title},
      ${year},
      ${description}
    )
    RETURNING
      survey_report_attachment_id as id;
  `;

  defaultLog.debug({
    label: 'postSurveyReportAttachmentSQL',
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
      survey_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size
    from
      survey_attachment
    where
      survey_id = ${surveyId}
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
 * @param {string} fileType
 * @returns {SQLStatement} sql query object
 */
export const putSurveyAttachmentSQL = (surveyId: number, fileName: string, fileType: string): SQLStatement | null => {
  defaultLog.debug({ label: 'putSurveyAttachmentSQL', message: 'params', surveyId, fileName, fileType });

  if (!surveyId || !fileName || !fileType) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      survey_attachment
    SET
      file_name = ${fileName},
      file_type = ${fileType}
    WHERE
      file_name = ${fileName}
    AND
      survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'putSurveyAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a report attachment for a single survey by survey id and filename.
 *
 * @param {number} surveyId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const putSurveyReportAttachmentSQL = (surveyId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'putSurveyReportAttachmentSQL', message: 'params', surveyId, fileName });

  if (!surveyId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      survey_report_attachment
    SET
      file_name = ${fileName}
    WHERE
      file_name = ${fileName}
    AND
      survey_id = ${surveyId};
  `;

  defaultLog.debug({
    label: 'putSurveyReportAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
