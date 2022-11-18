import SQL from 'sql-template-strings';
import { BaseRepository } from './base-repository';

/**
 * A repository class for accessing attachment data.
 *
 * @export
 * @class AttachmentRepository
 * @extends {BaseRepository}
 */
export class AttachmentRepository extends BaseRepository {
  async getProjectAttachments (projectId: number) {
    if (!projectId) {
      return null;
    }

    const sqlStatement = SQL`
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

    return sqlStatement;
  };

  async getProjectReportAttachments(projectId: number) {
    if (!projectId) {
      return null;
    }
  
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
  
    return sqlStatement;
  };
}
