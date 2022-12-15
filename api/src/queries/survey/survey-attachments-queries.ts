import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to insert a survey attachment row.
 *
 * @param {string} fileName
 * @param {number} fileSize
 * @param {string} fileType
 * @param {number} surveyId
 * @param {string} key to use in s3
 * @returns {SQLStatement} sql query object
 */
export const postSurveyAttachmentSQL = (
  fileName: string,
  fileSize: number,
  fileType: string,
  surveyId: number,
  key: string
): SQLStatement | null => {
  if (!fileName || !fileSize || !fileType || !surveyId || !key) {
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
      survey_attachment_id as id,
      revision_count;
  `;

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
      survey_id = ${surveyId}
    RETURNING
      survey_attachment_id as id,
      revision_count;

  `;

  return sqlStatement;
};

export interface ReportAttachmentMeta {
  title: string;
  description: string;
  yearPublished: string;
}
