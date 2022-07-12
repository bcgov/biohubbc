import { SQL, SQLStatement } from 'sql-template-strings';

/**
 * SQL query to get a single public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
    SELECT
      project.project_id as id,
      project.project_type_id as pt_id,
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
      project.project_id = ${projectId};
  `;
};

/**
 * SQL query to get public (published) project activities.
 *
 * @param {string} projectId
 * @returns {SQLStatement} sql query object
 */

export const getActivitiesByPublicProjectSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
    SELECT
      pa.activity_id
    from
      project_activity as pa
    LEFT OUTER JOIN
      project as p
    ON
      p.project_id = pa.project_id
    WHERE
      pa.project_id = ${projectId};
  `;
};

/**
 * SQL query to get all public facing (published) projects.
 *
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectListSQL = (): SQLStatement | null => {
  return SQL`
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
    group by
      p.project_id,
      p.name,
      p.start_date,
      p.end_date,
      p.coordinator_agency_name,
      pt.name;
  `;
};

/**
 * SQL query to get attachments for a single public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectAttachmentsSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
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
      pa.project_id = ${projectId};
  `;
};

/**
 * SQL query to get report attachments for a single public (published) project.
 *
 * @param {number} projectId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectReportAttachmentsSQL = (projectId: number): SQLStatement | null => {
  if (!projectId) {
    return null;
  }

  return SQL`
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
      pa.project_id = ${projectId};
  `;
};

/**
 * SQL query to get S3 key of an attachment for a single public (published) project.
 *
 * @param {number} projectId
 * @param {number} attachmentId
 * @returns {SQLStatement} sql query object
 */
export const getPublicProjectAttachmentS3KeySQL = (projectId: number, attachmentId: number): SQLStatement | null => {
  if (!projectId || !attachmentId) {
    return null;
  }

  return SQL`
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
  if (!projectId || !attachmentId) {
    return null;
  }

  return SQL`
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
  if (!projectId || !attachmentId) {
    return null;
  }

  return SQL`
    SELECT
      project_report_attachment_id as attachment_id,
      file_name,
      title,
      description,
      year as year_published,
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
  if (!projectReportAttachmentId) {
    return null;
  }

  return SQL`
    SELECT
      project_report_author.*
    FROM
      project_report_author
    where
      project_report_attachment_id = ${projectReportAttachmentId}
  `;
};
