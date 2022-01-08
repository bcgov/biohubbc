import { SQL, SQLStatement } from 'sql-template-strings';
import {
  PostReportAttachmentMetadata,
  PutReportAttachmentMetadata,
  IReportAttachmentAuthor
} from '../../models/project-attachments';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/project/project-attachments-queries');

/**
 * SQL query to get attachments for a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_attachment_id as id,
      file_name,
      file_type,
      update_date,
      create_date,
      file_size,
      key,
      security_token
    from
      project_attachment
    where
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get report attachments for a single project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getProjectReportAttachmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectReportAttachmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_report_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size,
      key,
      security_token
    from
      project_report_attachment
    where
      project_id = ${projectId};
  `;

  defaultLog.debug({
    label: 'getProjectReportAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete an attachment for a single project.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectAttachmentSQL = (attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteProjectAttachmentSQL', message: 'params', attachmentId });

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

  defaultLog.debug({
    label: 'deleteProjectAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to delete a report attachment for a single project.
 *
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const deleteProjectReportAttachmentSQL = (attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'deleteProjectReportAttachmentSQL', message: 'params', attachmentId });

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

  defaultLog.debug({
    label: 'deleteProjectReportAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

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
  defaultLog.debug({ label: 'getProjectAttachmentS3KeySQL', message: 'params', projectId });

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

  defaultLog.debug({
    label: 'getProjectAttachmentS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

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
  defaultLog.debug({ label: 'getProjectReportAttachmentS3KeySQL', message: 'params', projectId });

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

  defaultLog.debug({
    label: 'getProjectReportAttachmentS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project attachment row.
 *
 * @param fileName
 * @param fileSize
 * @param fileType
 * @param projectId
 * @param {string} key to use in s3
 * @returns {SQLStatement} sql query object
 */
export const postProjectAttachmentSQL = (
  fileName: string,
  fileSize: number,
  fileType: string,
  projectId: number,
  key: string
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectAttachmentSQL',
    message: 'params',
    fileName,
    fileSize,
    fileType,
    projectId,
    key
  });

  if (!fileName || !fileSize || !fileType || !projectId || !key) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_attachment (
      project_id,
      file_name,
      file_size,
      file_type,
      key
    ) VALUES (
      ${projectId},
      ${fileName},
      ${fileSize},
      ${fileType},
      ${key}
    )
    RETURNING
      project_attachment_id as id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'postProjectAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to insert a project report attachment row.
 *
 * @param fileName
 * @param fileSize
 * @param projectId
 * @param {string} key to use in s3
 * @returns {SQLStatement} sql query object
 */
export const postProjectReportAttachmentSQL = (
  fileName: string,
  fileSize: number,
  projectId: number,
  key: string,
  attachmentMeta: PostReportAttachmentMetadata
): SQLStatement | null => {
  defaultLog.debug({
    label: 'postProjectReportAttachmentSQL',
    message: 'params',
    fileName,
    fileSize,
    projectId,
    key
  });

  if (
    !fileName ||
    !fileSize ||
    !projectId ||
    !key ||
    !attachmentMeta?.title ||
    !attachmentMeta?.year_published ||
    !attachmentMeta?.description
  ) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_report_attachment (
      project_id,
      file_name,
      title,
      year,
      description,
      file_size,
      key
    ) VALUES (
      ${projectId},
      ${fileName},
      ${attachmentMeta.title},
      ${attachmentMeta.year_published},
      ${attachmentMeta.description},
      ${fileSize},
      ${key}
    )
    RETURNING
      project_report_attachment_id as id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'postProjectReportAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get an attachment for a single project by project id and filename.
 *
 * @param {number} projectId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const getProjectAttachmentByFileNameSQL = (projectId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectAttachmentByFileNameSQL', message: 'params', projectId });

  if (!projectId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size
    from
      project_attachment
    where
      project_id = ${projectId}
    and
      file_name = ${fileName};
  `;

  defaultLog.debug({
    label: 'getProjectAttachmentByFileNameSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get an attachment for a single project by project id and filename.
 *
 * @param {number} projectId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const getProjectReportAttachmentByFileNameSQL = (projectId: number, fileName: string): SQLStatement | null => {
  defaultLog.debug({ label: 'getProjectReportAttachmentByFileNameSQL', message: 'params', projectId });

  if (!projectId || !fileName) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_report_attachment_id as id,
      file_name,
      update_date,
      create_date,
      file_size
    from
      project_report_attachment
    where
      project_id = ${projectId}
    and
      file_name = ${fileName};
  `;

  defaultLog.debug({
    label: 'getProjectReportAttachmentByFileNameSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update an attachment for a single project by project id and filename and filetype.
 *
 * @param {number} projectId
 * @param {string} fileName
 * @param {string} fileType
 * @returns {SQLStatement} sql query object
 */
export const putProjectAttachmentSQL = (projectId: number, fileName: string, fileType: string): SQLStatement | null => {
  defaultLog.debug({ label: 'putProjectAttachmentSQL', message: 'params', projectId, fileName, fileType });

  if (!projectId || !fileName || !fileType) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      project_attachment
    SET
      file_name = ${fileName},
      file_type = ${fileType}
    WHERE
      file_name = ${fileName}
    AND
      project_id = ${projectId}
    RETURNING
      project_attachment_id as id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'putProjectAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to update a report attachment for a single project by project id and filename.
 *
 * @param {number} projectId
 * @param {string} fileName
 * @returns {SQLStatement} sql query object
 */
export const putProjectReportAttachmentSQL = (
  projectId: number,
  fileName: string,
  attachmentMeta: PutReportAttachmentMetadata
): SQLStatement | null => {
  defaultLog.debug({ label: 'putProjectReportAttachmentSQL', message: 'params', projectId, fileName });

  if (
    !projectId ||
    !fileName ||
    !attachmentMeta?.title ||
    !attachmentMeta?.year_published ||
    !attachmentMeta?.description
  ) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    UPDATE
      project_report_attachment
    SET
      file_name = ${fileName},
      title = ${attachmentMeta.title},
      year = ${attachmentMeta.year_published},
      description = ${attachmentMeta.description}
    WHERE
      file_name = ${fileName}
    AND
      project_id = ${projectId}
    RETURNING
      project_report_attachment_id as id,
      revision_count;
  `;

  defaultLog.debug({
    label: 'putProjectReportAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

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
  defaultLog.debug({
    label: 'updateProjectReportAttachmentMetadataSQL',
    message: 'params',
    projectId,
    attachmentId,
    metadata
  });

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

  defaultLog.debug({
    label: 'updateProjectReportAttachmentMetadataSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * Insert a new project report attachment author record, for the specified `attachmentId`
 *
 * @param {number} attachmentId
 * @param {IReportAttachmentAuthor} author
 * @return {*}  {(SQLStatement | null)}
 */
export const insertProjectReportAttachmentAuthorSQL = (
  attachmentId: number,
  author: IReportAttachmentAuthor
): SQLStatement | null => {
  defaultLog.debug({
    label: 'createProjectReportAttachmentAuthorSQL',
    message: 'params',
    attachmentId,
    author
  });

  if (!attachmentId || !author) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    INSERT INTO project_report_author (
      project_report_attachment_id,
      first_name,
      last_name
    ) VALUES (
      ${attachmentId},
      ${author.first_name},
      ${author.last_name}
    );
  `;

  defaultLog.debug({
    label: 'createProjectReportAttachmentAuthorSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * Delete all project report attachment author records, for the specified `attachmentId`.
 *
 * @param {number} attachmentId
 * @return {*}  {(SQLStatement | null)}
 */
export const deleteProjectReportAttachmentAuthorsSQL = (attachmentId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'deleteProjectReportAttachmentAuthorsSQL',
    message: 'params',
    attachmentId
  });

  if (!attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    DELETE
      FROM project_report_author
    WHERE
      project_report_attachment_id = ${attachmentId};
  `;

  defaultLog.debug({
    label: 'deleteProjectReportAttachmentAuthorsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * Get the metadata fields of  project report attachment, for the specified `projectId` and `attachmentId`.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @param {PutReportAttachmentMetadata} metadata
 * @return {*}  {(SQLStatement | null)}
 */
export const getProjectReportAttachmentSQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getProjectReportAttachmentSQL',
    message: 'params',
    projectId,
    attachmentId
  });

  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_report_attachment_id as attachment_id,
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
      project_report_attachment
    where
      project_report_attachment_id = ${attachmentId}
    and
      project_id = ${projectId}
  `;

  defaultLog.debug({
    label: 'updateProjectReportAttachmentSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * Get the metadata fields of  project report attachment, for the specified `projectId` and `attachmentId`.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @param {PutReportAttachmentMetadata} metadata
 * @return {*}  {(SQLStatement | null)}
 */
export const getProjectReportAuthorsSQL = (projectReportAttachmentId: number): SQLStatement | null => {
  defaultLog.debug({
    label: 'getProjectReportAuthorsSQL',
    message: 'params',
    projectReportAttachmentId
  });

  if (!projectReportAttachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      project_report_author.*
    FROM
      project_report_author
    where
      project_report_attachment_id = ${projectReportAttachmentId}
  `;

  defaultLog.debug({
    label: 'getProjectReportAuthorsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};
