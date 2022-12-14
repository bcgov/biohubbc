import { SQL, SQLStatement } from 'sql-template-strings';
import { PutReportAttachmentMetadata } from '../../models/project-survey-attachments';

/**
 * SQL query to delete an attachment for a single project.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectAttachmentSQL = (attachmentId: number): SQLStatement | null => {
  if (!attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_attachment
    WHERE
      project_attachment_id = ${attachmentId}
    RETURNING
      key;
  `;

  return sqlStatement;
};

/**
 * SQL query to delete a report attachment for a single project.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectReportAttachmentSQL = (attachmentId: number): SQLStatement | null => {
  if (!attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      from project_report_attachment
    WHERE
      project_report_attachment_id = ${attachmentId}
    RETURNING
      key;
  `;

  return sqlStatement;
};

/**
 * SQL query to get S3 key of an attachment for a single project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentS3KeySQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      key
    FROM
      project_attachment
    WHERE
      project_id = ${projectId}
    AND
      project_attachment_id = ${attachmentId};
  `;

  return sqlStatement;
};

/**
 * SQL query to get S3 key of a report attachment for a single project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getProjectReportAttachmentS3KeySQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      key
    FROM
      project_report_attachment
    WHERE
      project_id = ${projectId}
    AND
      project_report_attachment_id = ${attachmentId};
  `;

  return sqlStatement;
};

export interface ReportAttachmentMeta {
  title: string;
  description: string;
  yearPublished: string;
}

/**
 * Update the metadata fields of  project report attachment, for tjhe specified `projectId` and `attachmentId`.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @param {PutReportAttachmentMetadata} metadata
 * @return {*}  {(SQLStatement | null)}
 */
export const updateProjectReportAttachmentMetadataSQL = (
  projectId: number,
  attachmentId: number,
  metadata: PutReportAttachmentMetadata
): SQLStatement | null => {
  if (!projectId || !attachmentId || !metadata) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      project_report_attachment
    SET
      title = ${metadata.title},
      year = ${metadata.year_published},
      description = ${metadata.description}
    WHERE
      project_id = ${projectId}
    AND
      project_report_attachment_id = ${attachmentId}
    AND
      revision_count = ${metadata.revision_count};
  `;

  return sqlStatement;
};
