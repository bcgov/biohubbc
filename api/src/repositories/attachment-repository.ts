import SQL from 'sql-template-strings';
import { getKnex } from '../database/db';
import { ApiExecuteSQLError } from '../errors/api-error';
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

export interface IReportAttachmentAuthor {
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

  /**
   * Query to get a single project attachment by attachment ID/
   * @param {number} projectId The ID of the project
   * @param {number} attachmentId The ID of the attachment
   * @return {Promise<IProjectAttachment>} A promise resolving the project attachment having the
   * given ID.
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentById(projectId: number, attachmentId: number): Promise<IProjectAttachment> {
    defaultLog.debug({ label: 'getProjectAttachmentById' });

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
      throw new ApiExecuteSQLError('Failed to get project attachment by attachmentId', [
        'AttachmentRepository->getProjectAttachmentById',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * SQL query to get attachments for a single project, including security rule counts.
   * @param {number} projectId the ID of the project
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

  /**
   * Query to get all security reasons for a project attachment with the given ID.
   * @param {number} attachmentId The ID of the project attachment
   * @return {Promise<IProjectAttachmentSecurityReason[]>} Promise resolving all security reasons belonging to the
   * project attachment with the given ID.
   * @memberof AttachmentRepository
   */
  async getProjectAttachmentSecurityReasons(attachmentId: number): Promise<IProjectAttachmentSecurityReason[]> {
    defaultLog.debug({ label: 'getProjectAttachmentSecurityReasons' });

    const sqlStatement = SQL`
      SELECT
        pap.*,
        sa.user_identifier
      FROM
        project_attachment_persecution pap,
        system_user sa
      WHERE
        pap.create_user = sa.system_user_id
      AND
        pap.project_attachment_id = ${attachmentId};
    `;

    const response = await this.connection.sql<IProjectAttachmentSecurityReason>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachment security rules by attachmentId', [
        'AttachmentRepository->getProjectAttachmentSecurityReasons',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to attach multiple security rules to a project attachment.
   * @param {number[]} securityIds The IDs of the security rules to attach to the project attachment
   * @param {number} attachmentId The ID of the attachment getting the security rules.
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async addSecurityRulesToProjectAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'addSecurityRulesToProjectAttachment' });

    const queryBuilder = getKnex()
      .table('project_attachment_persecution')
      .insert(
        securityIds.map((persecution_security_id: number) => ({
          persecution_security_id,
          project_attachment_id: attachmentId
        }))
      )
      .onConflict(['project_attachment_id', 'persecution_security_id'])
      .ignore()
      .returning('persecution_security_id');

    const response = await this.connection.knex<{ persecution_security_id: number }>(queryBuilder);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to attach security rules to project attachment', [
        'AttachmentRepository->addSecurityRulesToProjectAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Query to update the security review timestamp to reflect the current time for a given
   * project attachment.
   * @param {number} attachmentId The ID of the attachment
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async addSecurityReviewTimeToProjectAttachment(attachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'addSecurityReviewTimeToProjectAttachment' });

    const sqlStatement = SQL`
      UPDATE
        project_attachment
      SET
        security_review_timestamp = now()
      WHERE
        project_attachment_id = ${attachmentId}
      RETURNING
        project_attachment_id;
      `;

    const response = await this.connection.sql<{ project_attachment_id: number }>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to update the security review timestamp for project attachment', [
        'AttachmentRepository->addSecurityReviewTimeToProjectAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * SQL query to detach specified security rules from a project attachment
   * @param {number} securityId the ID of the security rule to remove
   * @param {number} attachmentId the ID of the attachment to remove the security rule from
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeSecurityRuleFromProjectAttachment(securityId: number, attachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'removeSecurityRuleFromProjectAttachment' });

    const sqlStatement = SQL`
      DELETE FROM
        project_attachment_persecution
      WHERE
        project_attachment_id = ${attachmentId}
      AND
        persecution_security_id = ${securityId}
      RETURNING
        project_attachment_id;
      `;

    const response = await this.connection.sql<{ project_attachment_id: number }>(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete project attachment security rule.', [
        'AttachmentRepository->removeSecurityRuleFromProjectAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * SQL query to delete all security rules for a project attachment.
   * @param {number} attachmentId the ID of the project attachment
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromProjectAttachment(attachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'removeAllSecurityFromProjectAttachment' });

    const sqlStatement = SQL`
      DELETE FROM
        project_attachment_persecution
      WHERE
        project_attachment_id = ${attachmentId}
      RETURNING
        project_attachment_id;
      `;

    const response = await this.connection.sql<{ project_attachment_id: number }>(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to delete all project attachment security rules.', [
        'AttachmentRepository->removeAllSecurityFromProjectAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * Query to return all project report attachments belonging to the given project.
   * @param {number} projectId the ID of the project
   * @return {Promise<IProjectReportAttachment[]>} Promise resolving all of the attachments for the
   * given project
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachments(projectId: number): Promise<IProjectReportAttachment[]> {
    defaultLog.debug({ label: 'getProjectReportAttachments' });

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
   * SQL query to get report attachments for a single project, including security rule counts.
   * @param {number} projectId the ID of the given project
   * @return {Promise<WithSecurityRuleCount<IProjectReportAttachment>[]>} Promise resolving all of the given
   * project's attachments, including security rule counts.
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

  /**
   * Query to return the report attachment having the given ID and belonging to the given project.
   * @param {number} projectId the ID of the project
   * @param {number} reportAttachmentId the ID of the report attachment
   * @return {Promise<IProjectReportAttachment>} Promise resolving the report attachment
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachmentById(
    projectId: number,
    reportAttachmentId: number
  ): Promise<IProjectReportAttachment> {
    defaultLog.debug({ label: 'getProjectReportAttachmentById' });

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
        project_report_attachment_id = ${reportAttachmentId}
      AND
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IProjectReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachments by reportAttachmentId', [
        'AttachmentRepository->getProjectReportAttachmentById',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Query to return all security reasons for a given project report attachment
   * @param {number} reportAttachmentId the ID of the given project report attachment
   * @return {Promise<IProjectReportSecurityReason[]>} Promise resolving the security reasons for the report.
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachmentSecurityReasons(reportAttachmentId: number): Promise<IProjectReportSecurityReason[]> {
    defaultLog.debug({ label: 'getProjectReportSecurityReasons' });

    const sqlStatement = SQL`
      SELECT
        prp.*,
        sa.user_identifier
      FROM
        project_report_persecution prp,
        system_user sa
      WHERE
          prp.create_user = sa.system_user_id
      AND
        project_report_attachment_id = ${reportAttachmentId};
    `;

    const response = await this.connection.sql<IProjectReportSecurityReason>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachment security rules by reportAttachmentId', [
        'AttachmentRepository->getProjectReportSecurityReasons',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to attach multiple security rules to a project report attachment.
   * @param {number[]} securityIds The IDs of the security rules to attach to the report attachment
   * @param {number} reportAttachmentId The ID of the report attachment getting the security rules.
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async addSecurityRulesToProjectReportAttachment(securityIds: number[], reportAttachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'addSecurityRulesToProjectReportAttachment' });

    const queryBuilder = getKnex()
      .table('project_report_persecution')
      .insert(
        securityIds.map((persecution_security_id: number) => ({
          persecution_security_id,
          project_report_attachment_id: reportAttachmentId
        }))
      )
      .onConflict(['project_report_attachment_id', 'persecution_security_id'])
      .ignore()
      .returning('persecution_security_id');

    const response = await this.connection.knex<{ persecution_security_id: number }>(queryBuilder);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to attach security rules to the given project report attachment', [
        'AttachmentRepository->addSecurityRulesToProjectReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Query to update the security review timestamp to reflect the current time for a given
   * project report attachment.
   * @param {number} reportAttachmentId The ID of the report attachment
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async addSecurityReviewTimeToProjectReportAttachment(reportAttachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'addSecurityReviewTimeToProjectReportAttachment' });

    const sqlStatement = SQL`
      UPDATE
        project_report_attachment
      SET
        security_review_timestamp = now()
      WHERE
        project_report_attachment_id = ${reportAttachmentId}
      RETURNING
        project_report_attachment_id;
      `;

    const response = await this.connection.sql<{ project_report_attachment_id: number }>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to update the security review timestamp for project report attachment', [
        'AttachmentRepository->addSecurityReviewTimeToProjectReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * SQL query to detach specified security rules from a project report attachment
   * @param {number} securityId the ID of the security rule to remove
   * @param {number} reportAttachmentId the ID of the report attachment to remove the security rule from
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeSecurityRuleFromProjectReportAttachment(securityId: number, reportAttachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'removeSecurityRuleFromProjectReportAttachment' });

    const sqlStatement = SQL`
      DELETE FROM
        project_report_persecution
      WHERE
        project_report_attachment_id = ${reportAttachmentId}
      AND
        persecution_security_id = ${securityId}
      RETURNING
        project_report_attachment_id;
      `;

    const response = await this.connection.sql<{ project_report_attachment_id: number }>(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete project report attachment security rule.', [
        'AttachmentRepository->removeSecurityRuleFromProjectReportAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * SQL query to delete all security rules for a project report attachment.
   * @param {number} reportAttachmentId the ID of the project report attachment
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromProjectReportAttachment(reportAttachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'removeAllSecurityFromProjectReportAttachment' });

    const sqlStatement = SQL`
      DELETE FROM
        project_report_persecution
      WHERE
        project_report_attachment_id = ${reportAttachmentId}
      RETURNING
        project_report_attachment_id;
      `;

    const response = await this.connection.sql<{ project_report_attachment_id: number }>(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to delete all project report attachment security rules.', [
        'AttachmentRepository->removeAllSecurityFromProjectReportAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * SQL query to get survey attachments for a single project.
   *
   * @param {number} surveyId The survey ID
   * @return {Promise<IProjectAttachment[]>} Promise resolving all survey attachments
   * @memberof AttachmentRepository
   */
  async getSurveyAttachments(surveyId: number): Promise<ISurveyAttachment[]> {
    defaultLog.debug({ label: 'getSurveyAttachments' });

    const sqlStatement = SQL`
      SELECT
        survey_attachment_id as id,
        file_name,
        file_type,
        create_date,
        update_date,
        create_date,
        file_size,
        key,
        security_token,
        security_review_timestamp
      FROM
        survey_attachment
      WHERE
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
   * SQL query to get attachments for a single survey, including security rule counts.
   * @param {number} surveyId the ID of the survey
   * @return {Promise<WithSecurityCounts<IProjectAttachment[]>>} Promise resolving all survey attachments with
   * security rule counts.
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

    const response = await this.connection.sql<WithSecurityRuleCount<ISurveyAttachment>>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey attachments with security rule count by surveyId', [
        'AttachmentRepository->getSurveyAttachmentsWithSecurityCounts',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to get all security reasons for a survey attachment with the given ID.
   * @param {number} attachmentId The ID of the survey attachment
   * @return {Promise<ISurveyAttachmentSecurityReason[]>} Promise resolving all security reasons belonging to the
   * survey attachment with the given ID.
   * @memberof AttachmentRepository
   */
  async getSurveyAttachmentSecurityReasons(attachmentId: number): Promise<ISurveyAttachmentSecurityReason[]> {
    defaultLog.debug({ label: 'getSurveyAttachmentSecurityReasons' });

    const sqlStatement = SQL`
      SELECT
        sap.*,
        sa.user_identifier
      FROM
        survey_attachment_persecution sap,
        system_user sa
      WHERE
        sap.create_user = sa.system_user_id
      AND
        sap.survey_attachment_id = ${attachmentId};
      `;

    const response = await this.connection.sql<ISurveyAttachmentSecurityReason>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey attachment security rules by attachmentId', [
        'AttachmentRepository->getSurveyAttachmentSecurityReasons',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to attach multiple security rules to a survey attachment.
   * @param {number[]} securityIds The IDs of the security rules to attach to the survey attachment
   * @param {number} attachmentId The ID of the attachment getting the security rules.
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async addSecurityRulesToSurveyAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'addSecurityRulesToSurveyAttachment' });

    const queryBuilder = getKnex()
      .table('survey_attachment_persecution')
      .insert(
        securityIds.map((persecution_security_id: number) => ({
          persecution_security_id,
          survey_attachment_id: attachmentId
        }))
      )
      .onConflict(['survey_attachment_id', 'persecution_security_id'])
      .ignore()
      .returning('persecution_security_id');

    const response = await this.connection.knex<{ persecution_security_id: number }>(queryBuilder);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to attach security rules to survey attachment', [
        'AttachmentRepository->addSecurityRulesToSurveyAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Query to update the security review timestamp to reflect the current time for a given
   * survey attachment.
   * @param {number} attachmentId The ID of the attachment
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async addSecurityReviewTimeToSurveyAttachment(attachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'addSecurityReviewTimeToSurveyAttachment' });

    const sqlStatement = SQL`
      UPDATE
        survey_attachment
      SET
        security_review_timestamp = now()
      WHERE
        survey_attachment_id = ${attachmentId}
      RETURNING
        survey_attachment_id;
      `;

    const response = await this.connection.sql<{ survey_attachment_id: number }>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to update the security review timestamp for survey attachment', [
        'AttachmentRepository->addSecurityReviewTimeToSurveyAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * SQL query to detach specified security rules from a survey attachment
   * @param {number} securityId the ID of the security rule to remove
   * @param {number} attachmentId the ID of the attachment to remove the security rule from
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeSecurityRuleFromSurveyAttachment(securityId: number, attachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'removeSecurityRuleFromSurveyAttachment' });

    const sqlStatement = SQL`
      DELETE FROM
        survey_attachment_persecution
      WHERE
        survey_attachment_id = ${attachmentId}
      AND
        persecution_security_id = ${securityId}
      RETURNING
        survey_attachment_id;
      `;

    const response = await this.connection.sql<{ survey_attachment_id: number }>(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey attachment security rule.', [
        'AttachmentRepository->removeSecurityRuleFromSurveyAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * SQL query to delete all security rules for a survey attachment.
   * @param {number} attachmentId the ID of the survey attachment
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromSurveyAttachment(attachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'removeAllSecurityFromSurveyAttachment' });

    const sqlStatement = SQL`
        DELETE FROM
          survey_attachment_persecution
        WHERE
          survey_attachment_id = ${attachmentId}
        RETURNING
          survey_attachment_id;
        `;

    const response = await this.connection.sql<{ survey_attachment_id: number }>(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to delete all survey attachment security rules.', [
        'AttachmentRepository->removeAllSecurityFromSurveyAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * Query to return all survey report attachments belonging to the given survey.
   * @param {number} surveyId the ID of the survey
   * @return {Promise<ISurveyReportAttachment[]>} Promise resolving all of the attachments for the
   * given survey
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachments(surveyId: number): Promise<ISurveyReportAttachment[]> {
    defaultLog.debug({ label: 'getSurveyReportAttachments' });

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
   * SQL query to get report attachments for a single survey, including security rule counts.
   * @param {number} surveyId the ID of the given project
   * @return {Promise<WithSecurityRuleCount<ISurveyReportAttachment>[]>} Promise resolving all of the given
   * survey's attachments, including security rule counts.
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

  /**
   * Query to attach multiple security rules to a survey report attachment.
   * @param {number[]} securityIds The IDs of the security rules to attach to the report attachment
   * @param {number} reportAttachmentId The ID of the report attachment getting the security rules.
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async addSecurityRulesToSurveyReportAttachment(securityIds: number[], reportAttachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'addSecurityRulesToSurveyReportAttachments' });

    const queryBuilder = getKnex()
      .table('survey_report_persecution')
      .insert(
        securityIds.map((persecution_security_id: number) => ({
          persecution_security_id,
          survey_report_attachment_id: reportAttachmentId
        }))
      )
      .onConflict(['survey_report_attachment_id', 'persecution_security_id'])
      .ignore()
      .returning('persecution_security_id');

    const response = await this.connection.knex<{ persecution_security_id: number }>(queryBuilder);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to attach security rules to the given survey report attachment', [
        'AttachmentRepository->addSecurityRulesToSurveyReportAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * Query to update the security review timestamp to reflect the current time for a given
   * survey report attachment.
   * @param {number} reportAttachmentId The ID of the report attachment
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async addSecurityReviewTimeToSurveyReportAttachment(reportAttachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'addSecurityReviewTimeToSurveyReportAttachment' });

    const sqlStatement = SQL`
      UPDATE
        survey_report_attachment
      SET
        security_review_timestamp=now()
      WHERE
        survey_report_attachment_id = ${reportAttachmentId}
      RETURNING
        survey_report_attachment_id;
      `;

    const response = await this.connection.sql<{ survey_report_attachment_id: number }>(sqlStatement);

    if (!response.rows) {
      throw new ApiExecuteSQLError('Failed to update the security review timestamp for survey report attachment', [
        'AttachmentRepository->addSecurityReviewTimeToSurveyReportAttachment',
        'rows was null or undefined, expected rows != null'
      ]);
    }
  }

  /**
   * SQL query to detach specified security rules from a survey report attachment
   * @param {number} securityId the ID of the security rule to remove
   * @param {number} reportAttachmentId the ID of the report attachment to remove the security rule from
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeSecurityRuleFromSurveyReportAttachment(securityId: number, reportAttachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'removeSecurityRuleFromSurveyReportAttachment' });

    const sqlStatement = SQL`
      DELETE FROM
        survey_report_persecution
      WHERE
        survey_report_attachment_id = ${reportAttachmentId}
      AND
        persecution_security_id = ${securityId}
      RETURNING
        survey_report_attachment_id;
      `;

    const response = await this.connection.sql<{ survey_report_attachment_id: number }>(sqlStatement);

    if (!response.rowCount) {
      throw new ApiExecuteSQLError('Failed to delete survey report attachment security rule.', [
        'AttachmentRepository->removeSecurityRuleFromSurveyReportAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * SQL query to delete all security rules for a survey report attachment.
   * @param {number} reportAttachmentId the ID of the survey report attachment
   * @return {Promise<void>}
   * @memberof AttachmentRepository
   */
  async removeAllSecurityFromSurveyReportAttachment(reportAttachmentId: number): Promise<void> {
    defaultLog.debug({ label: 'removeAllSecurityFromSurveyReportAttachment' });

    const sqlStatement = SQL`
      DELETE FROM
        survey_report_persecution
      WHERE
        survey_report_attachment_id = ${reportAttachmentId}
      RETURNING
        survey_report_attachment_id;
      `;

    const response = await this.connection.sql<{ survey_report_attachment_id: number }>(sqlStatement);

    if (!response) {
      throw new ApiExecuteSQLError('Failed to delete all survey report attachment security rules.', [
        'AttachmentRepository->removeAllSecurityFromSurveyReportAttachment',
        'rowCount was 0 or undefined, expected rowCount == 1'
      ]);
    }
  }

  /**
   * Query to return the report attachment having the given ID and belonging to the given survey.
   * @param {number} surveyId the ID of the survey
   * @param {number} reportAttachmentId the ID of the report attachment
   * @return {Promise<IProjectReportAttachment>} Promise resolving the report attachment
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentById(surveyId: number, reportAttachmentId: number): Promise<ISurveyReportAttachment> {
    defaultLog.debug({ label: 'getSurveyReportAttachmentById' });

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
      WHERE
        survey_report_attachment_id = ${reportAttachmentId}
      AND
        survey_id = ${surveyId}
      `;

    const response = await this.connection.sql<ISurveyReportAttachment>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachments by reportAttachmentId', [
        'AttachmentRepository->getSurveyReportAttachmentById',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0];
  }

  /**
   * Query to return all security reasons for a given survey report attachment
   * @param {number} reportAttachmentId the ID of the given survey report attachment
   * @return {Promise<IProjectReportSecurityReason[]>} Promise resolving the security reasons for the report.
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentSecurityReasons(reportAttachmentId: number): Promise<ISurveyReportSecurityReason[]> {
    defaultLog.debug({ label: 'getSurveyReportSecurityReasons' });

    const sqlStatement = SQL`
      SELECT
        srp.*,
        sa.user_identifier
      FROM
        survey_report_persecution srp,
        system_user sa
      WHERE
        srp.create_user = sa.system_user_id
      AND
        srp.survey_report_attachment_id = ${reportAttachmentId};
      `;

    const response = await this.connection.sql<ISurveyReportSecurityReason>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachment security rules by reportAttachmentId', [
        'AttachmentRepository->getSurveyReportSecurityReasons',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to return all of the authors belonging to a project report attachment
   * @param {number} reportAttachmentId The ID of the report attachment
   * @return {Promise<IReportAttachmentAuthor[]>} Promise resolving the report authors
   * @memberof AttachmentRepository
   */
  async getProjectReportAttachmentAuthors(reportAttachmentId: number): Promise<IReportAttachmentAuthor[]> {
    defaultLog.debug({ label: 'getProjectAttachmentAuthors' });

    const sqlStatement = SQL`
      SELECT
        project_report_author.*
      FROM
        project_report_author
      WHERE
        project_report_attachment_id = ${reportAttachmentId}
      `;

    const response = await this.connection.sql<IReportAttachmentAuthor>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachment authors by reportAttachmentId', [
        'AttachmentRepository->getProjectAttachmentAuthors',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  /**
   * Query to return all of the authors belonging to a survey report attachment
   * @param {number} reportAttachmentId The ID of the report attachment
   * @return {Promise<IReportAttachmentAuthor[]>} Promise resolving the report authors
   * @memberof AttachmentRepository
   */
  async getSurveyReportAttachmentAuthors(reportAttachmentId: number): Promise<IReportAttachmentAuthor[]> {
    defaultLog.debug({ label: 'getSurveyAttachmentAuthors' });

    const sqlStatement = SQL`
      SELECT
        survey_report_author.*
      FROM
        survey_report_author
      WHERE
        survey_report_attachment_id = ${reportAttachmentId};
      `;

    const response = await this.connection.sql<IReportAttachmentAuthor>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get survey report attachment authors by reportAttachmentId', [
        'AttachmentRepository->getSurveyAttachmentAuthors',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async getSurveyAttachmentCountToReview(surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        count(*)
      FROM
        survey_attachment
      where
        survey_id = ${surveyId}
      and
        security_review_timestamp is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get count of survey attachments that need review', [
        'AttachmentRepository->getSurveyAttachmentCountToReview',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }

  async getSurveyReportCountToReview(surveyId: number): Promise<number> {
    const sqlStatement = SQL`
      SELECT
        count(*)
      FROM
        survey_report_attachment
      where
        survey_id = ${surveyId}
      and
        security_review_timestamp is null;
    `;

    const response = await this.connection.sql(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get count of survey reports that need review', [
        'AttachmentRepository->getSurveyReportCountToReview',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows[0].count;
  }
}
