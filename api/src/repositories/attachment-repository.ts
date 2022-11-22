import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
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

  // TODO functions need to handle duplicate keys (re adding existing security reasons)
  async addSecurityToAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    const insertStatement = SQL`
      INSERT INTO project_attachment_persecution (
        project_attachment_id, 
        persecution_security_id
      ) VALUES `;

    securityIds.forEach((id, index) => {
      insertStatement.append(SQL`
      (${attachmentId},${id})`);

      if (index !== securityIds.length - 1) {
        insertStatement.append(',');
      }
    });
    insertStatement.append(';');

    try {
      await this.connection.sql(insertStatement);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityToAttachments', message: 'error', error });
    }
  }

  // TODO functions need to handle duplicate keys (re adding existing security reasons)
  async addSecurityToReportAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    const insertStatement = SQL`
      INSERT INTO project_report_persecution (
        project_report_attachment_id, 
        persecution_security_id
      ) VALUES `;

    securityIds.forEach((id, index) => {
      insertStatement.append(SQL`
      (${attachmentId},${id})`);

      if (index !== securityIds.length - 1) {
        insertStatement.append(',');
      }
    });

    insertStatement.append(';');

    try {
      await this.connection.sql(insertStatement);
    } catch (error) {
      defaultLog.error({ label: 'addSecurityToAttachments', message: 'error', error });
    }
  }

  async addSecurityReviewTimeToReportAttachment(attachmentId: number): Promise<void> {
    const updateSQL = SQL`
      UPDATE  project_report_attachment 
      SET security_review_timestamp=now()
      WHERE project_report_attachment_id=${attachmentId};`;

      try {
        
        await this.connection.sql(updateSQL)
      } catch (error) {
        defaultLog.error({ label: 'addSecurityReviewTimeToReportAttachment', message: 'error', error });
      }
  }

  async addSecurityReviewTimeToAttachment(attachmentId: number): Promise<void> {
    const updateSQL = SQL`
      UPDATE  project_attachment 
      SET security_review_timestamp=now()
      WHERE project_attachment_id=${attachmentId};`;

      try {
        
        await this.connection.sql(updateSQL)
      } catch (error) {
        defaultLog.error({ label: 'addSecurityReviewTimeToAttachment', message: 'error', error });
      }
  }
}
