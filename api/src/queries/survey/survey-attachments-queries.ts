import { SQL, SQLStatement } from 'sql-template-strings';

import {
  PostReportAttachmentMetadata,
  PutReportAttachmentMetadata,
  IReportAttachmentAuthor
} from '../../models/project-survey-attachments';

/**
 * SQL query to get attachments for a single survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyAttachmentsSQL = (surveyId: number): SQLStatement | null => {
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
      security_token
    from
      survey_attachment
    where
      survey_id = ${surveyId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get the list of report attachments for a single survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyReportAttachmentsSQL = (surveyId: number): SQLStatement | null => {
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
      security_token
    from
      survey_report_attachment
    where
      survey_id = ${surveyId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get report attachments for a single survey.
 *
 * @param {number} surveyId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyReportAttachmentSQL = (surveyId: number, attachmentId: number): SQLStatement | null => {
  if (!surveyId || !attachmentId) {
    return null;
  }
  const sqlStatement: SQLStatement = SQL`
  SELECT
    survey_report_attachment_id as attachment_id,
    file_name,
    title,
    description,
    year,
    update_date,
    create_date,
    file_size,
    key,
    security_token,
    revision_count
  FROM
    survey_report_attachment
  where
    survey_report_attachment_id = ${attachmentId}
  and
    survey_id = ${surveyId}
  `;

  return sqlStatement;
};

/**
 * SQL query to delete an attachment for a single survey.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyAttachmentSQL = (attachmentId: number): SQLStatement | null => {
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

  return sqlStatement;
};

/**
 * SQL query to delete a report attachment for a single survey.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteSurveyReportAttachmentSQL = (attachmentId: number): SQLStatement | null => {
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

  return sqlStatement;
};

/**
 * SQL query to get S3 key of a report attachment for a single survey.
 *
 * @param {number} surveyId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getSurveyReportAttachmentS3KeySQL = (surveyId: number, attachmentId: number): SQLStatement | null => {
  if (!surveyId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      key
    FROM
      survey_report_attachment
    WHERE
      survey_id = ${surveyId}
    AND
      survey_report_attachment_id = ${attachmentId};
  `;

  return sqlStatement;
};

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
  surveyId: number,
  key: string,
  attachmentMeta: PostReportAttachmentMetadata
): SQLStatement | null => {
  if (!fileName || !fileSize || !surveyId || !key) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_report_attachment (
      survey_id,
      file_name,
      title,
      year,
      description,
      file_size,
      key
    ) VALUES (
      ${surveyId},
      ${fileName},
      ${attachmentMeta.title},
      ${attachmentMeta.year_published},
      ${attachmentMeta.description},
      ${fileSize},
      ${key}
    )
    RETURNING
      survey_report_attachment_id as id,
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
 * SQL query to get an attachment for a single survey by survey id and filename.
 *
 * @param {number} surveyId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const getSurveyReportAttachmentByFileNameSQL = (surveyId: number, fileName: string): SQLStatement | null => {
  if (!surveyId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      survey_report_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size
    from
      survey_report_attachment
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

/**
 * SQL query to update a report attachment for a single survey by survey id and filename.
 *
 * @param {number} surveyId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const putSurveyReportAttachmentSQL = (
  surveyId: number,
  fileName: string,
  attachmentMeta: PutReportAttachmentMetadata
): SQLStatement | null => {
  if (!surveyId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      survey_report_attachment
    SET
      file_name = ${fileName},
      title = ${attachmentMeta.title},
      year = ${attachmentMeta.year_published},
      description = ${attachmentMeta.description}
    WHERE
      file_name = ${fileName}
    AND
      survey_id = ${surveyId}
    RETURNING
      survey_report_attachment_id as id,
      revision_count;
  `;

  return sqlStatement;
};

export interface ReportAttachmentMeta {
  title: string;
  description: string;
  yearPublished: string;
}

/**
 * Update the metadata fields of  survey report attachment, for the specified `surveyId` and `attachmentId`.
 *
 * @param {number} surveyId
 * @param {number} attachmentId
 * @param {PutReportAttachmentMetadata} metadata
 * @return {*}  {(SQLStatement | null)}
 */
export const updateSurveyReportAttachmentMetadataSQL = (
  surveyId: number,
  attachmentId: number,
  metadata: PutReportAttachmentMetadata
): SQLStatement | null => {
  if (!surveyId || !attachmentId || !metadata) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      survey_report_attachment
    SET
      title = ${metadata.title},
      year = ${metadata.year_published},
      description = ${metadata.description}
    WHERE
      survey_id = ${surveyId}
    AND
      survey_report_attachment_id = ${attachmentId}
    AND
      revision_count = ${metadata.revision_count};
  `;

  return sqlStatement;
};

/**
 * Insert a new survey report attachment author record, for the specified `attachmentId`
 *
 * @param {number} attachmentId
 * @param {IReportAttachmentAuthor} author
 * @return {*}  {(SQLStatement | null)}
 */
export const insertSurveyReportAttachmentAuthorSQL = (
  attachmentId: number,
  author: IReportAttachmentAuthor
): SQLStatement | null => {
  if (!attachmentId || !author) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO survey_report_author (
      survey_report_attachment_id,
      first_name,
      last_name
    ) VALUES (
      ${attachmentId},
      ${author.first_name},
      ${author.last_name}
    );
  `;

  return sqlStatement;
};

/**
 * Delete all project report attachment author records, for the specified `attachmentId`.
 *
 * @param {number} attachmentId
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteSurveyReportAttachmentAuthorsSQL = (attachmentId: number): SQLStatement | null => {
  if (!attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE FROM
      survey_report_author
    WHERE
      survey_report_attachment_id = ${attachmentId};
  `;

  return sqlStatement;
};

/**
 * Get the metadata fields of  survey report attachment, for the specified `surveyId` and `attachmentId`.
 *
 * @param {number} surveyId
 * @param {number} attachmentId
 * @param {PutReportAttachmentMetadata} metadata
 * @return {*}  {(SQLStatement | null)}
 */
export const getSurveyReportAuthorsSQL = (surveyReportAttachmentId: number): SQLStatement | null => {
  if (!surveyReportAttachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      survey_report_author.*
    FROM
      survey_report_author
    where
      survey_report_attachment_id = ${surveyReportAttachmentId}
  `;

  return sqlStatement;
};
