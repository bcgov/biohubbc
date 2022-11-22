import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { HTTP400 } from '../errors/http-error';
import { getLogger } from '../utils/logger';
import { BaseRepository } from './base-repository';

/**
 * @TODO find all definitions of this interface and replace them by importing this
 * interface
 * @TODO see new fields added to IGetAttachmentsSource from pull #845 (securityReviewTimestamp)
 */
export interface IGetAttachmentsSource {
  file_name: string;
  file_type: string;
  title: string;
  description: string;
  key: string;
  file_size: string;
  is_secure: string;
}

export interface IGetAttachment {
  attachment_id: number;
  file_name: string;
  title: string;
  description: string;
  year_published: number;
  last_modified: string;
  create_date: string;
  key: string;
  file_size: string;
  security_token: string;
  security_review_timestamp: string;
  revision_count: number;
}

export interface IGetAttachmentAuthor {
  project_report_author_id: number;
  project_report_attachment_id: number;
  first_name: string;
  last_name: string;
  update_date: string;
  revision_count: number;
}

export interface IGetAttachmentSecurityReason {
  project_report_author_id: number;
  project_report_attachment_id: number;
  persecution_security_id: number;
  update_date: string;
}

/**
 * @TODO find all definitions of this interface and replace them by importing this
 * interface
 */
export interface IGetReportAttachmentsSource {
  file_name: string;
  title: string;
  year: string;
  description: string;
  key: string;
  file_size: string;
  is_secure: string;
  authors?: { author: string }[];
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
  async getProjectAttachments(projectId: number): Promise<IGetAttachmentsSource[]> {
    defaultLog.debug({ label: 'getProjectAttachments' });

    const sqlStatement = SQL`
      SELECT
        project_attachment_id AS id,
        file_name,
        file_type,
        update_date,
        create_date,
        file_size,
        key,
        security_token
      FROM
        project_attachment
      WHERE
        project_id = ${projectId};
    `;

    const response = await this.connection.sql<IGetAttachmentsSource>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project attachments by projectId', [
        'AttachmentRepository->getProjectAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async getProjectReportAttachments(projectId: number): Promise<IGetReportAttachmentsSource[]> {
    const sqlStatement = SQL`
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

    const response = await this.connection.sql<IGetReportAttachmentsSource>(sqlStatement);

    if (!response || !response.rows) {
      throw new ApiExecuteSQLError('Failed to get project report attachments by projectId', [
        'AttachmentRepository->getProjectReportAttachments',
        'rows was null or undefined, expected rows != null'
      ]);
    }

    return response.rows;
  }

  async addSecurityToAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    // TODO
  }

  /**
   * SQL query to delete security for Project Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<{ project_attachment_persecution_id: number }>}
   * @memberof AttachmentRepository
   */
  async removeSecurityFromProjectAttachment(
    securityId: number,
    attachmentId: number
  ): Promise<{ project_attachment_persecution_id: number }> {
    const sqlStatement = SQL`
      DELETE FROM
        project_attachment_persecution
      WHERE
        project_attachment_id = ${attachmentId}
      AND
        project_attachment_persecution_id =  ${securityId}
      RETURNING project_attachment_persecution_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to Delete Project Attachment Security', [
        'AttachmentRepository->removeSecurityFromProjectAttachment',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result;
  }

  /**
   * SQL query to delete security for Survey Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<{ survey_attachment_persecution_id: number }>}
   * @memberof AttachmentRepository
   */
  async removeSecurityFromSurveyAttachment(
    securityId: number,
    attachmentId: number
  ): Promise<{ survey_attachment_persecution_id: number }> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_attachment_persecution
      WHERE
        survey_attachment_id = ${attachmentId}
      AND
        survey_attachment_persecution_id =  ${securityId}
      RETURNING survey_attachment_persecution_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to Delete Survey Attachment Security', [
        'AttachmentRepository->removeSecurityFromSurveyAttachment',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result;
  }

  async addSecurityToReportAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    // TODO
  }

  /**
   * SQL query to delete security for Project Report Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<{ project_report_persecution_id: number }>}
   * @memberof AttachmentRepository
   */
  async removeSecurityFromProjectReportAttachment(
    securityId: number,
    attachmentId: number
  ): Promise<{ project_report_persecution_id: number }> {
    const sqlStatement = SQL`
      DELETE FROM
        project_report_persecution
      WHERE
        project_report_attachment_id = ${attachmentId}
      AND
        project_report_persecution_id =  ${securityId}
      RETURNING project_report_persecution_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to Delete Project Report Attachment Security', [
        'AttachmentRepository->removeSecurityFromProjectReportAttachment',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result;
  }

  /**
   * SQL query to delete security for Survey Report Attachment
   *
   * @param {number} securityId
   * @param {number} attachmentId
   * @return {*}  {Promise<{ survey_report_persecution_id: number }>}
   * @memberof AttachmentRepository
   */
  async removeSecurityFromSurveyReportAttachment(
    securityId: number,
    attachmentId: number
  ): Promise<{ survey_report_persecution_id: number }> {
    const sqlStatement = SQL`
      DELETE FROM
        survey_report_persecution
      WHERE
        survey_report_attachment_id = ${attachmentId}
      AND
        survey_report_persecution_id =  ${securityId}
      RETURNING survey_report_persecution_id
      ;
      `;

    const response = await this.connection.sql(sqlStatement);

    const result = (response && response.rows && response.rows[0]) || null;

    if (!result) {
      throw new ApiExecuteSQLError('Failed to Delete Survey Report Attachment Security', [
        'AttachmentRepository->removeSecurityFromSurveyReportAttachment',
        'row[0] was null or undefined, expected row[0] != null'
      ]);
    }

    return result;
  }

  async getProjectReportAttachment(projectId: number, attachmentId: number): Promise<IGetAttachment> {
    const sqlStatement = SQL`
      SELECT
      project_report_attachment_id as attachment_id,
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
    where
      project_report_attachment_id = ${attachmentId}
    and
      project_id = ${projectId}
  `;

    const response = await this.connection.sql<IGetAttachment>(sqlStatement);

    console.log('in repository: ', response);

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

  async getProjectAttachmentSecurityReasons(
    projectReportAttachmentId: number
  ): Promise<IGetAttachmentSecurityReason[]> {
    const sqlStatement = SQL`
      SELECT
        project_report_persecution.*
      FROM
        project_report_persecution
      where
        project_report_attachment_id = ${projectReportAttachmentId}
    `;

    const response = await this.connection.sql<IGetAttachmentSecurityReason>(sqlStatement);

    if (!response || !response.rows) {
      throw new HTTP400('Failed to get project attachment security reasons by attachment id');
    }

    return response.rows;
  }
}
