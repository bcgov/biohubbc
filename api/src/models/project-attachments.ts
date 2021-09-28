import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-attachments');

/**
 * Pre-processes GET project attachments data
 *
 * @export
 * @class GetProjectAttachmentsData
 */
export class GetProjectAttachmentsData {
  attachmentsList: any[];

  constructor(attachmentsData?: any) {
    defaultLog.debug({ label: 'GetProjectAttachmentsData', message: 'params', attachmentsData });

    this.attachmentsList =
      (attachmentsData?.length &&
        attachmentsData.map((item: any) => {
          return {
            id: item.id,
            fileName: item.file_name,
            fileType: item.file_type || 'Report',
            lastModified: item.update_date || item.create_date,
            size: item.file_size,
            securityToken: item.security_token
          };
        })) ||
      [];
  }
}
