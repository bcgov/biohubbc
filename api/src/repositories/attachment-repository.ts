import SQL from 'sql-template-strings';
import { ApiExecuteSQLError } from '../errors/api-error';
import { BaseRepository } from './base-repository';

export class AttachmentRepository extends BaseRepository {
  async addSecurityToAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    // TODO
  }

  async removeSecurityFromAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    securityIds.forEach(async (securityId) => {
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
        throw new ApiExecuteSQLError('Failed to get Delete Security Attachment', [
          'AttachmentRepository->removeSecurityFromAttachment',
          'row[0] was null or undefined, expected row[0] != null'
        ]);
      }
    });
  }

  async addSecurityToReportAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    // TODO
  }

  async removeSecurityFromReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    securityIds.forEach(async (securityId) => {
      const sqlStatement = SQL`
      DELETE FROM
        project_report_persecution
      WHERE
        project_report_id = ${attachmentId}
      AND
        project_report_persecution_id =  ${securityId}
      RETURNING project_report_persecution_id
      ;
      `;

      const response = await this.connection.sql(sqlStatement);

      const result = (response && response.rows && response.rows[0]) || null;

      if (!result) {
        throw new ApiExecuteSQLError('Failed to get Delete Security Attachment', [
          'AttachmentRepository->removeSecurityFromAttachment',
          'row[0] was null or undefined, expected row[0] != null'
        ]);
      }
    });
  }
}
