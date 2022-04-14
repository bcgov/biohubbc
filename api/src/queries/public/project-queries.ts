import { SQL, SQLStatement } from 'sql-template-strings';
import { getLogger } from '../../utils/logger';

const defaultLog = getLogger('queries/public/project-queries');

/**
 * SQL query to get a single public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      project.project_id as id,
      project_type.name as type,
      project.name,
      project.location_description,
      project.start_date,
      project.end_date,
      project.caveats,
      project.comments,
      project.geojson as geometry,
      project.publish_timestamp as publish_date
    from
      project
    left outer join
      project_type
        on project.project_type_id = project_type.project_type_id
    where
      project.project_id = ${projectId}
    and project.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get public (published) project activities.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */

export const getActivitiesByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getActivitiesByPublicProjectSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement = SQL`
    SELECT
      a.name
    from
      project_activity as pa
    LEFT OUTER JOIN
      project as p
    ON
      p.project_id = pa.project_id
    LEFT OUTER JOIN
      activity as a
    ON
      a.activity_id = pa.activity_id
    where pa.project_id = ${projectId}
    and p.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getActivitiesByPublicProjectSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get all public facing (published) projects.
 *
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectListSQL = (): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectListSQL', message: 'params' });

  const sqlStatement = SQL`
    SELECT
      p.project_id as id,
      p.name,
      p.start_date,
      p.end_date,
      p.coordinator_agency_name as coordinator_agency,
      pt.name as project_type,
      string_agg(DISTINCT pp.number, ', ') as permits_list
    from
      project as p
    left outer join project_type as pt
      on p.project_type_id = pt.project_type_id
    left outer join permit as pp
      on p.project_id = pp.project_id
    where
      p.publish_timestamp is not null
    group by
      p.project_id,
      p.name,
      p.start_date,
      p.end_date,
      p.coordinator_agency_name,
      pt.name;
  `;

  defaultLog.debug({
    label: 'getPublicProjectListSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get attachments for a single public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectAttachmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectAttachmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      pa.project_attachment_id as id,
      pa.file_name,
      pa.update_date,
      pa.create_date,
      pa.file_size,
      pa.file_type,
      CASE WHEN api_security_check(pa.security_token,pa.create_user) THEN false ELSE true END as is_secured
    from
      project_attachment as pa
    left outer join
      project as p
    on
      p.project_id = pa.project_id
    where
      pa.project_id = ${projectId}
    and
      p.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getPublicProjectAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get report attachments for a single public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectReportAttachmentsSQL = (projectId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectReportAttachmentsSQL', message: 'params', projectId });

  if (!projectId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      pa.project_report_attachment_id as id,
      pa.file_name,
      pa.update_date,
      pa.create_date,
      pa.file_size,
      CASE WHEN api_security_check(pa.security_token,pa.create_user) THEN false ELSE true END as is_secured
    from
      project_report_attachment as pa
    left outer join
      project as p
    on
      p.project_id = pa.project_id
    where
      pa.project_id = ${projectId}
    and
      p.publish_timestamp is not null;
  `;

  defaultLog.debug({
    label: 'getPublicProjectReportAttachmentsSQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get S3 key of an attachment for a single public (published) project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectAttachmentS3KeySQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectAttachmentS3KeySQL', message: 'params', attachmentId });

  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      CASE WHEN api_security_check(security_token,create_user) THEN key ELSE null
      END as key
    FROM
      project_attachment
    WHERE
      project_id = ${projectId}
    AND
      project_attachment_id = ${attachmentId};
  `;

  defaultLog.debug({
    label: 'getPublicProjectAttachmentS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * SQL query to get S3 key of a report attachment for a single public (published) project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectReportAttachmentS3KeySQL = (
  projectId: number,
  attachmentId: number
): SQLStatement | null => {
  defaultLog.debug({ label: 'getPublicProjectReportAttachmentS3KeySQL', message: 'params', attachmentId });

  if (!projectId || !attachmentId) {
    return null;
  }

  const sqlStatement: SQLStatement = SQL`
    SELECT
      CASE WHEN api_security_check(security_token,create_user) THEN key ELSE null
      END as key
    FROM
      project_report_attachment
    WHERE
      project_id = ${projectId}
    AND
      project_report_attachment_id = ${attachmentId};
  `;

  defaultLog.debug({
    label: 'getPublicProjectReportAttachmentS3KeySQL',
    message: 'sql',
    'sqlStatement.text': sqlStatement.text,
    'sqlStatement.values': sqlStatement.values
  });

  return sqlStatement;
};

/**
 * Get the metadata fields of an unsecured project report attachment, for the specified `projectId` and `attachmentId`.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @param {PutReportAttachmentMetadata} metadata
 * @return {*}  {(SQLStatement | null)}
 */
export const getPublicProjectReportAttachmentSQL = (projectId: number, attachmentId: number): SQLStatement | null => {
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
      CASE WHEN api_security_check(security_token,create_user) THEN key ELSE null
      END as key,
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
