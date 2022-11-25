import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { HTTP400 } from '../errors/http-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

/**
 * @TODO
 */
export interface IGetSurveyAttachment {
  something: any;
}

/**
 * @TODO
 */
export interface IGetSurveyReportAttachment {
  something: any;
}

export interface IGetProjectAttachment {
  id: number;
  file_name: string;
  file_type: string;
  create_user: number;
  create_date: string;
  update_date: string;
  file_size: string;
  key: string;
  security_token: string;
  security_review_timestamp: string | null;
}

export interface IGetReportAttachment {
  id: number;
  file_name: string;
  create_user: number;
  title: string;
  description: string;
  year_published: number;
  last_modified: string;
  create_date: string;
  key: string;
  file_size: string;
  security_token: string;
  security_review_timestamp: string | null;
  revision_count: number;
}

export type AttachmentStatus = 'PENDING_REVIEW' | 'SECURED' | 'UNSECURED' | 'SUBMITTED';

export type WithSecurityRuleCount<T> = T & { security_rule_count: number };
export type WithAttachmentStatus<T> = T & { status: AttachmentStatus };

export interface IGetAttachmentAuthor {
  project_report_author_id: number;
  project_report_attachment_id: number;
  first_name: string;
  last_name: string;
  update_date: string;
  revision_count: number;
}

export interface IGetProjectReportSecurityReason {
  project_report_persecution_id: number;
  project_report_attachment_id: number;
  persecution_security_id: number;
}

export interface IGetProjectAttachmentSecurityReason {
  project_attachment_persecution_id: number;
  project_attachment_id: number;
  persecution_security_id: number;
}

export interface IGetSurveyReportSecurityReason {
  survey_report_persecution_id: number;
  survey_report_attachment_id: number;
  persecution_security_id: number;
}

export interface IGetSurveyAttachmentSecurityReason {
  survey_attachment_persecution_id: number;
  survey_attachment_id: number;
  persecution_security_id: number;
}

const defaultLog = getLogger('repositories/attachment-repository');

/**
 * A repository class for accessing attachment data.
 *
 * @export
 * @class AttachmentRepository
 * @extends {BaseRepository}
 */
export class AttachmentRepository extends BaseRepository {
  /**
   * SQL query to get report attachments for a single project.
   *
   * @param {number} projectId
   * @return {*}
   * @memberof AttachmentRepository
   */
  async getProjectAttachments(projectId: number): Promise<IGetProjectAttachment[]> {
    defaultLog.debug({ label: 'getProjectAttachments' });

    const sqlStatement = SQL`
      SELECT
        project_attachment_id AS id,
        file_name,
        file_type,
        create_user,
        update_date,
        create_date,
        file_size,
        key,
        security_token,
        security_review_timestamp
      FROM
        project_attachment
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IGetProjectAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachments by projectId', [
        'AttachmentRepository->getProjectAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async getProjectReportAttachments(projectId: number): Promise<IGetReportAttachment[]> {
    const sqlStatement = SQL`
      SELECT
        project_report_attachment_id as id,
        file_name,
        create_user,
        title,
        description,
        year::int as year_published,
        update_date::text as last_modified,
        create_date,
        file_size,
        key,
        security_token,
        security_review_timestamp,
        revision_count
      FROM
        project_report_attachment
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IGetReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachments by projectId', [
        'AttachmentRepository->getProjectReportAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * SQL query to get report attachments for a single project, including security rule counts
   *
   * @param {number} projectId
   * @return {*}
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IGetProjectAttachment>[]> {
    defaultLog.debug({ label: 'getProjectAttachmentsWithSecurityCounts' });

    const sqlStatement = SQL`
      SELECT
        pa.project_attachment_id AS id,
        pa.file_name,
        pa.file_type,
        pa.create_user,
        pa.update_date,
        pa.create_date,
        pa.file_size,
        pa.key,
        pa.security_token,
        pa.security_review_timestamp,
        COALESCE(src.count, 0) AS security_rule_count
      FROM
        project_attachment pa
      LEFT JOIN (
          SELECT DISTINCT ON (pap.project_attachment_id)
            pap.project_attachment_id,
            COUNT(pap.project_attachment_id) AS count
          FROM
            project_attachment_persecution pap
          GROUP BY
            pap.project_attachment_id
      ) src
      ON
        pa.project_attachment_id = src.project_attachment_id
      WHERE
        pa.project_id = ${projectId};
    `;

    const response = await this.connection.sql<WithSecurityRuleCount<IGetProjectAttachment>>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachments with security rule count by projectId', [
        'AttachmentRepository->getProjectAttachmentsWithSecurityCounts',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * SQL query to get report attachments for a single project, including security rule counts
   *
   * @param {number} projectId
   * @return {*}
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IGetProjectAttachment>[]> {
    defaultLog.debug({ label: 'getProjectAttachmentsWithSecurityCounts' });

    const sqlStatement = SQL`
      SELECT
        pra.project_report_attachment_id as id,
        pra.file_name,
        pra.create_user,
        pra.title,
        pra.description,
        pra.year::int as year_published,
        pra.update_date::text as last_modified,
        pra.create_date,
        pra.file_size,
        pra.key,
        pra.security_token,
        pra.security_review_timestamp,
        pra.revision_count,
        COALESCE(src.count, 0) AS security_rule_count
      FROM
        project_report_attachment pra
      LEFT JOIN (
          SELECT DISTINCT ON (prp.project_report_attachment_id)
            prp.project_report_attachment_id,
            COUNT(prp.project_report_attachment_id) AS count
          FROM
            project_report_persecution prp
          GROUP BY
            prp.project_report_attachment_id
      ) src
      ON
        pra.project_report_attachment_id = src.project_report_attachment_id
      WHERE
        pra.project_id = ${projectId}
    `;

    const response = await this.connection.sql<WithSecurityRuleCount<IGetProjectAttachment>>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachments with security rule count by projectId', [
        'AttachmentRepository->getProjectAttachmentsWithSecurityCounts',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async addSecurityToProjectAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    const insertStatement = SQL`
      INSERT INTO project_attachment_persecution (
        project_attachment_id,
        persecution_security_id
      ) VALUES `;

    insertStatement.append(
      securityIds
        .map((id) => {
          return `(${attachmentId},${id})`;
        })
        .join(',')
    );

    insertStatement.append(' ON CONFLICT (project_attachment_id, persecution_security_id) DO NOTHING;');

    try {
      await this.connection.sql(insertStatement);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityToProjectAttachments', message: 'error', error });
    }
  }

  async addSecurityToProjectReportAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    const insertStatement = SQL`
    INSERT INTO project_report_persecution (
      project_report_attachment_id,
      persecution_security_id
    ) VALUES `;

    insertStatement.append(
      securityIds
        .map((id) => {
          return `(${attachmentId},${id})`;
        })
        .join(',')
    );

    insertStatement.append(' ON CONFLICT (project_report_attachment_id, persecution_security_id) DO NOTHING;');

    try {
      await this.connection.sql(insertStatement);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityToProjectReportAttachments', message: 'error', error });
    }
  }

  async addSecurityToSurveyAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    const insertStatement = SQL`
      INSERT INTO survey_attachment_persecution (
        survey_attachment_id,
        persecution_security_id
      ) VALUES `;

    insertStatement.append(
      securityIds
        .map((id) => {
          return `(${attachmentId},${id})`;
        })
        .join(',')
    );

    insertStatement.append(' ON CONFLICT (survey_attachment_id, persecution_security_id) DO NOTHING;');

    try {
      await this.connection.sql(insertStatement);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityToSurveyAttachments', message: 'error', error });
    }
  }

  async addSecurityToSurveyReportAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    const insertStatement = SQL`
        INSERT INTO survey_report_persecution (
          survey_report_attachment_id,
          persecution_security_id
        ) VALUES `;

    insertStatement.append(
      securityIds
        .map((id) => {
          return `(${attachmentId},${id})`;
        })
        .join(',')
    );

    insertStatement.append(' ON CONFLICT (survey_report_attachment_id, persecution_security_id) DO NOTHING;');

    try {
      await this.connection.sql(insertStatement);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityToSurveyReportAttachments', message: 'error', error });
    }
  }

  /**
   * SQL to delete all security reasons from a Project Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromAProjectAttachment(attachmentId: number): Promise<void> {
    const deleteSQL = SQL`
      DELETE FROM
        project_attachment_persecution
      WHERE project_attachment_id = ${attachmentId};
    `;

    await this.connection.sql(deleteSQL);
  }

  /**
   * SQL to delete all security reasons from a Project Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromAProjectReportAttachment(attachmentId: number): Promise<void> {
    const deleteSQL = SQL`
        DELETE FROM
          project_report_attachment_persecution
        WHERE project_attachment_id = ${attachmentId};
      `;

    await this.connection.sql(deleteSQL);
  }

  /**
   * SQL to delete all security reasons from a Survey Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromASurveyAttachment(attachmentId: number): Promise<void> {
    const deleteSQL = SQL`
      DELETE FROM
        survey_attachment_persecution
      WHERE survey_attachment_id = ${attachmentId};
    `;

    await this.connection.sql(deleteSQL);
  }

  /**
   * SQL to delete all security reasons from a Survey Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromASurveyReportAttachment(attachmentId: number): Promise<void> {
    const deleteSQL = SQL`
        DELETE FROM
          survey_report_attachment_persecution
        WHERE survey_attachment_id = ${attachmentId};
      `;

    await this.connection.sql(deleteSQL);
  }

  /**
   * SQL query to delete security for Project Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeSecurityFromProjectAttachment(securityId: number, attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        project_attachment_persecution
      WHERE
        project_attachment_id = ${attachmentId}
      AND
        persecution_security_id =  ${securityId};
      `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to Delete Project Attachment Security', [
        'AttachmentRepository->removeSecurityFromProjectAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * SQL query to delete security for Survey Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeSecurityFromSurveyAttachment(securityId: number, attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_attachment_persecution
      WHERE
        survey_attachment_id = ${attachmentId}
      AND
      persecution_security_id =  ${securityId};
      `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to Delete Survey Attachment Security', [
        'AttachmentRepository->removeSecurityFromSurveyAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  async addSecurityReviewTimeToProjectReportAttachment(attachmentId: number): Promise<void> {
    const updateSQL = SQL`
      UPDATE  project_report_attachment
      SET security_review_timestamp=now()
      WHERE project_report_attachment_id=${attachmentId};`;

    try {
      await this.connection.sql(updateSQL);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityReviewTimeToReportAttachment', message: 'error', error });
    }
  }

  async addSecurityReviewTimeToProjectAttachment(attachmentId: number): Promise<void> {
    const updateSQL = SQL`
      UPDATE  project_attachment
      SET security_review_timestamp=now()
      WHERE project_attachment_id=${attachmentId};`;

    try {
      await this.connection.sql(updateSQL);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityReviewTimeToAttachment', message: 'error', error });
    }
  }

  async addSecurityReviewTimeToSurveyReportAttachment(attachmentId: number): Promise<void> {
    const updateSQL = SQL`
      UPDATE  survey_report_attachment
      SET security_review_timestamp=now()
      WHERE survey_report_attachment_id=${attachmentId};`;

    try {
      await this.connection.sql(updateSQL);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityReviewTimeToReportAttachment', message: 'error', error });
    }
  }

  async addSecurityReviewTimeToSurveyAttachment(attachmentId: number): Promise<void> {
    const updateSQL = SQL`
      UPDATE  survey_attachment
      SET security_review_timestamp=now()
      WHERE survey_attachment_id=${attachmentId};`;

    try {
      await this.connection.sql(updateSQL);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityReviewTimeToAttachment', message: 'error', error });
    }
  }

  /**
   * SQL query to delete security for Project Report Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeSecurityFromProjectReportAttachment(securityId: number, attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        project_report_persecution
      WHERE
        project_report_attachment_id = ${attachmentId}
      AND
        persecution_security_id =  ${securityId};
      `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to Delete Project Report Attachment Security', [
        'AttachmentRepository->removeSecurityFromProjectReportAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * SQL query to delete security for Survey Report Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeSecurityFromSurveyReportAttachment(securityId: number, attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_report_persecution
      WHERE
        survey_report_attachment_id = ${attachmentId}
      AND
        persecution_security_id =  ${securityId};
      `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to Delete Survey Report Attachment Security', [
        'AttachmentRepository->removeSecurityFromSurveyReportAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  async getProjectReportAttachmentById(projectId: number, attachmentId: number): Promise<IGetReportAttachment> {
    const sqlStatement = SQL`
      SELECT
        project_report_attachment_id as id,
        file_name,
        title,
        description,
        year::int as year_published,
        update_date::text as last_modified,
        create_date,
        file_size,
        key,
        security_token,
        security_review_timestamp,
        revision_count
      FROM
        project_report_attachment
      WHERE
        project_report_attachment_id = ${attachmentId}
      AND
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IGetReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project attachment by attachment id');
    }

    return response.rows[0];
  }

  async getSurveyReportAttachmentById(surveyId: number, attachmentId: number): Promise<IGetReportAttachment> {
    const sqlStatement = SQL`
    SELECT
      survey_report_attachment_id as id,
      file_name,
      title,
      description,
      year::int as year_published,
      update_date::text as last_modified,
      create_date,
      file_size,
      key,
      security_token,
      security_review_timestamp,
      revision_count
    FROM
      survey_report_attachment
    where
      survey_report_attachment_id = ${attachmentId}
    and
      survey_id = ${surveyId}
    `;

    const response = await this.connection.sql<IGetReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project attachment by attachment id');
    }

    return response.rows[0];
  }

  async getProjectAttachmentAuthors(projectReportAttachmentId: number): Promise<IGetAttachmentAuthor[]> {
    const sqlStatement = SQL`
      SELECT
        project_report_author.*
      FROM
        project_report_author
      where
        project_report_attachment_id = ${projectReportAttachmentId}
    `;

    const response = await this.connection.sql<IGetAttachmentAuthor>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project attachment authors by attachment id');
    }

    return response.rows;
  }

  async getSurveyAttachmentAuthors(surveyReportAttachmentId: number): Promise<IGetAttachmentAuthor[]> {
    const sqlStatement = SQL`
      SELECT
        survey_report_author.*
      FROM
        survey_report_author
      where
        survey_report_attachment_id = ${surveyReportAttachmentId}
    `;

    const response = await this.connection.sql<IGetAttachmentAuthor>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project attachment authors by attachment id');
    }

    return response.rows;
  }

  async getProjectReportSecurityReasons(projectReportAttachmentId: number): Promise<IGetProjectReportSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        project_report_persecution.*
      FROM
        project_report_persecution
      where
        project_report_attachment_id = ${projectReportAttachmentId}
    `;

    const response = await this.connection.sql<IGetProjectReportSecurityReason>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project attachment security reasons by attachment id');
    }

    return response.rows;
  }

  async getSurveyReportSecurityReasons(surveyReportAttachmentId: number): Promise<IGetSurveyReportSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        survey_report_persecution.*
      FROM
        survey_report_persecution
      where
        survey_report_attachment_id = ${surveyReportAttachmentId}
    `;

    const response = await this.connection.sql<IGetSurveyReportSecurityReason>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get survey attachment security reasons by attachment id');
    }

    return response.rows;
  }

  async getProjectAttachmentSecurityReasons(
    projectAttachmentId: number
  ): Promise<IGetProjectAttachmentSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        project_attachment_persecution.*
      FROM
        project_attachment_persecution
      where
        project_attachment_id = ${projectAttachmentId}
    `;

    const response = await this.connection.sql<IGetProjectAttachmentSecurityReason>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project attachment security reasons by attachment id');
    }

    return response.rows;
  }

  async getSurveyAttachmentSecurityReasons(surveyAttachmentId: number): Promise<IGetSurveyAttachmentSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        survey_attachment_persecution.*
      FROM
        survey_attachment_persecution
      where
        survey_attachment_id = ${surveyAttachmentId}
      `;

    const response = await this.connection.sql<IGetSurveyAttachmentSecurityReason>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get  attachment security reasons by attachment id');
    }

    return response.rows;
  }
}
