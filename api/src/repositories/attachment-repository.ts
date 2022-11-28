import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { HTTP400 } from '../errors/http-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

export type ISurveyAttachment = IProjectAttachment;

export type ISurveyReportAttachment = IProjectReportAttachment;

export interface IProjectAttachment {
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

export interface IProjectReportAttachment {
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

export type WithSecurityRuleCount<T> = T & { security_rule_count: number };

export interface IAttachmentAuthor {
  project_report_author_id: number;
  project_report_attachment_id: number;
  first_name: string;
  last_name: string;
  update_date: string;
  revision_count: number;
}

export interface IProjectReportSecurityReason {
  project_report_persecution_id: number;
  project_report_attachment_id: number;
  persecution_security_id: number;
  create_date: string;
  user_identifier: string;
}

export interface IProjectAttachmentSecurityReason {
  project_attachment_persecution_id: number;
  project_attachment_id: number;
  persecution_security_id: number;
  create_date: string;
  user_identifier: string;
}

export interface ISurveyReportSecurityReason {
  survey_report_persecution_id: number;
  survey_report_attachment_id: number;
  persecution_security_id: number;
  create_date: string;
  user_identifier: string;
}

export interface ISurveyAttachmentSecurityReason {
  survey_attachment_persecution_id: number;
  survey_attachment_id: number;
  persecution_security_id: number;
  create_date: string;
  user_identifier: string;
}

const defaultLog = getLogger('repositories/attachment-repository');

/**
 * A repository class for accessing project and survey attachment data and
 * enumerating attachment security rules.
 *
 * @export
 * @class AttachmentRepository
 * @extends {BaseRepository}
 */
export class AttachmentRepository extends BaseRepository {
  /**
   * SQL query to get report attachments for a single project.
   *
   * @param {number} projectId The project ID
   * @return {Promise<IProjectAttachment[]>} Promise resolving all project attachments
   * @memberof AttachmentRepository
   */
  async getProjectAttachments(projectId: number): Promise<IProjectAttachment[]> {
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

    const response = await this.connection.sql<IProjectAttachment>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachments by projectId', [
        'AttachmentRepository->getProjectAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async getProjectAttachmentById(projectId: number, attachmentId: number): Promise<IProjectAttachment> {
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
        project_attachment_id = ${attachmentId}
      AND
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IProjectAttachment>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get project attachment by attachment id');
    }

    return response.rows[0];
  }

  /**
   * SQL query to get attachments for a single project, including security rule counts.
   *
   * @param {number} projectId
   * @return {Promise<WithSecurityCounts<IProjectAttachment[]>>} Promise resolving all project attachments with 
   * security rule counts.
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IProjectAttachment>[]> {
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

    const response = await this.connection.sql<WithSecurityRuleCount<IProjectAttachment>>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachments with security rule count by projectId', [
        'AttachmentRepository->getProjectAttachmentsWithSecurityCounts',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async getProjectAttachmentSecurityReasons(projectAttachmentId: number): Promise<IProjectAttachmentSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        pap.*, sa.user_identifier
      FROM
        project_attachment_persecution pap,  system_user sa
      WHERE
        pap.create_user = sa.system_user_id
      AND pap.project_attachment_id = ${projectAttachmentId};
    `;

    const response = await this.connection.sql<IProjectAttachmentSecurityReason>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get project attachment security reasons by attachment id');
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
   * SQL query to delete all security for Project Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromProjectAttachment(attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
        DELETE FROM
          project_attachment_persecution
        WHERE
          project_attachment_id = ${attachmentId}
        ;
        `;

    const response = await this.connection.sql(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to Delete all Project Attachment Security', [
        'AttachmentRepository->removeAllSecurityFromProjectAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
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

  /**
   * PROJECT REPORT ATTACHMENTS
   *
   * @memberof AttachmentRepository
   * @type Project Report Attachments
   *
   */

  async getProjectReportAttachments(projectId: number): Promise<IProjectReportAttachment[]> {
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

    const response = await this.connection.sql<IProjectReportAttachment>(sqlStatement);

    if (!response.rows) {
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
  async getProjectReportAttachmentsWithSecurityCounts(
    projectId: number
  ): Promise<WithSecurityRuleCount<IProjectReportAttachment>[]> {
    defaultLog.debug({ label: 'getProjectReportAttachmentsWithSecurityCounts' });

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
      ;
    `;

    const response = await this.connection.sql<WithSecurityRuleCount<IProjectReportAttachment>>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachments with security rule count by projectId', [
        'AttachmentRepository->getProjectReportAttachmentsWithSecurityCounts',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async getProjectReportAttachmentById(projectId: number, attachmentId: number): Promise<IProjectReportAttachment> {
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

    const response = await this.connection.sql<IProjectReportAttachment>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get project attachment by attachment id');
    }

    return response.rows[0];
  }

  async getProjectReportSecurityReasons(projectReportAttachmentId: number): Promise<IProjectReportSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        prp.*, sa.user_identifier
      FROM
        project_report_persecution prp, system_user sa
      WHERE
          prp.create_user = sa.system_user_id
      AND project_report_attachment_id = ${projectReportAttachmentId};
    `;

    const response = await this.connection.sql<IProjectReportSecurityReason>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get project attachment security reasons by attachment id');
    }

    return response.rows;
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
   * SQL query to delete all security for Project Report Attachment
   *
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromProjectReportAttachment(attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
      DELETE FROM
        project_report_persecution
      WHERE
        project_report_attachment_id = ${attachmentId}
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to Delete All Project Report Attachment Security', [
        'AttachmentRepository->removeAllSecurityFromProjectReportAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * SURVEY ATTACHMENTS
   *
   * @memberof AttachmentRepository
   * @type Survey Attachments
   *
   */

  async getSurveyAttachments(surveyId: number): Promise<ISurveyAttachment[]> {
    defaultLog.debug({ label: 'getProjectAttachments' });

    const sqlStatement = SQL`
      SELECT
        survey_attachment_id as id,
        file_name,
        file_type,
        create_date,
        update_date,
        create_data,
        file_size,
        key,
        security_token,
        security_review_timestamp
      from
        survey_attachment
      where
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<ISurveyAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey attachments by surveyId', [
        'AttachmentRepository->getSurveyAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * SQL query to get attachments for a single survey, including security rule counts
   *
   * @param {number} projectId
   * @return {*}
   * @memberof AttachmentRepository
   */
  async getSurveyAttachmentsWithSecurityCounts(surveyId: number): Promise<WithSecurityRuleCount<ISurveyAttachment>[]> {
    defaultLog.debug({ label: 'getSurveyAttachmentsWithSecurityCounts' });

    const sqlStatement = SQL`
      SELECT
        sa.survey_attachment_id AS id,
        sa.file_name,
        sa.file_type,
        sa.create_user,
        sa.update_date,
        sa.create_date,
        sa.file_size,
        sa.key,
        sa.security_token,
        sa.security_review_timestamp,
        COALESCE(src.count, 0) AS security_rule_count
      FROM
        survey_attachment sa
      LEFT JOIN (
          SELECT DISTINCT ON (sap.survey_attachment_id)
            sap.survey_attachment_id,
            COUNT(sap.survey_attachment_id) AS count
          FROM
            survey_attachment_persecution sap
          GROUP BY
            sap.survey_attachment_id
      ) src
      ON
        sa.survey_attachment_id = src.survey_attachment_id
      WHERE
        sa.survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<WithSecurityRuleCount<IProjectAttachment>>(sqlStatement);

    console.log('response', response);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachments with security rule count by projectId', [
        'AttachmentRepository->getProjectAttachmentsWithSecurityCounts',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async getSurveyAttachmentSecurityReasons(surveyAttachmentId: number): Promise<ISurveyAttachmentSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        sap.*, sa.user_identifier
      FROM
        survey_attachment_persecution sap, system_user sa
      WHERE
          sap.create_user = sa.system_user_id
      AND sap.survey_attachment_id = ${surveyAttachmentId};
      `;

    const response = await this.connection.sql<ISurveyAttachmentSecurityReason>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get  attachment security reasons by attachment id');
    }

    return response.rows;
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

  /**
   * SQL query to delete all security for Survey Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromSurveyAttachment(attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
        DELETE FROM
          survey_attachment_persecution
        WHERE
          survey_attachment_id = ${attachmentId}
        ;
        `;

    const response = await this.connection.sql(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to Delete all Survey Attachment Security', [
        'AttachmentRepository->removeAllSecurityFromSurveyAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
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
   * SURVEY REPORT ATTACHMENTS
   *
   * @memberof AttachmentRepository
   * @type Survey Report Attachments
   *
   */

  async getSurveyReportAttachments(surveyId: number): Promise<ISurveyReportAttachment[]> {
    const sqlStatement = SQL`
      SELECT
        survey_report_attachment_id as id,
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
        survey_report_attachment
      WHERE
        survey_id = ${surveyId};
    `;

    const response = await this.connection.sql<ISurveyReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachments by surveyId', [
        'AttachmentRepository->getSurveyReportAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * SQL query to get report attachments for a single survey, including security rule counts
   *
   * @param {number} projectId
   * @return {*}
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentsWithSecurityCounts(
    surveyId: number
  ): Promise<WithSecurityRuleCount<ISurveyReportAttachment>[]> {
    defaultLog.debug({ label: 'getSurveyReportAttachmentsWithSecurityCounts' });
    const sqlStatement = SQL`
      SELECT
        sra.survey_report_attachment_id as id,
        sra.file_name,
        sra.create_user,
        sra.title,
        sra.description,
        sra.year::int as year_published,
        sra.update_date::text as last_modified,
        sra.create_date,
        sra.file_size,
        sra.key,
        sra.security_token,
        sra.security_review_timestamp,
        sra.revision_count,
        COALESCE(src.count, 0) AS security_rule_count
      FROM
        survey_report_attachment sra
      LEFT JOIN (
          SELECT DISTINCT ON (srp.survey_report_attachment_id)
            srp.survey_report_attachment_id,
            COUNT(srp.survey_report_attachment_id) AS count
          FROM
            survey_report_persecution srp
          GROUP BY
            srp.survey_report_attachment_id
      ) src
      ON
        sra.survey_report_attachment_id = src.survey_report_attachment_id
      WHERE
        sra.survey_id = ${surveyId}
      ;
    `;

    const response = await this.connection.sql<WithSecurityRuleCount<ISurveyReportAttachment>>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachments with security rule count by surveyId', [
        'AttachmentRepository->getSurveyReportAttachmentsWithSecurityCounts',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
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

  /**
   * SQL query to delete all security for Survey Report Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromSurveyReportAttachment(attachmentId: number): Promise<void> {
    const sqlStatement = SQL`
          DELETE FROM
            survey_report_persecution
          WHERE
            survey_report_attachment_id = ${attachmentId}
          ;
          `;

    const response = await this.connection.sql(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to Delete Survey Report Attachment Security', [
        'AttachmentRepository->removeAllSecurityFromSurveyReportAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  async getSurveyReportAttachmentById(surveyId: number, attachmentId: number): Promise<IProjectReportAttachment> {
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

    const response = await this.connection.sql<IProjectReportAttachment>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get project attachment by attachment id');
    }

    return response.rows[0];
  }

  async getSurveyReportSecurityReasons(surveyReportAttachmentId: number): Promise<ISurveyReportSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        srp.*, sa.user_identifier
      FROM
        survey_report_persecution srp, system_user sa
      WHERE
        srp.create_user = sa.system_user_id
      AND srp.survey_report_attachment_id = ${surveyReportAttachmentId};
    `;

    const response = await this.connection.sql<ISurveyReportSecurityReason>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get survey attachment security reasons by attachment id');
    }

    return response.rows;
  }

  async getProjectAttachmentAuthors(projectReportAttachmentId: number): Promise<IAttachmentAuthor[]> {
    const sqlStatement = SQL`
      SELECT
        project_report_author.*
      FROM
        project_report_author
      where
        project_report_attachment_id = ${projectReportAttachmentId}
    `;

    const response = await this.connection.sql<IAttachmentAuthor>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get project attachment authors by attachment id');
    }

    return response.rows;
  }

  async getSurveyAttachmentAuthors(surveyReportAttachmentId: number): Promise<IAttachmentAuthor[]> {
    const sqlStatement = SQL`
      SELECT
        survey_report_author.*
      FROM
        survey_report_author
      where
        survey_report_attachment_id = ${surveyReportAttachmentId}
    `;

    const response = await this.connection.sql<IAttachmentAuthor>(sqlStatement);

    if (!response.rows) {
      throw new HTTP400('Failed to get project attachment authors by attachment id');
    }

    return response.rows;
  }
}
