import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-survey-attachments');

/**
 * Pre-processes GET project/survey attachments data
 *
 * @export
 * @class GetAttachmentsData
 */
export class GetAttachmentsData {
  attachmentsList: any[];

  constructor(attachmentsData?: any) {
    defaultLog.debug({ label: 'GetAttachmentsData', message: 'params', attachmentsData });

    this.attachmentsList =
      (attachmentsData?.length &&
        attachmentsData.map((item: any) => {
          return {
            id: item.id,
            fileName: item.file_name,
            lastModified: item.update_date || item.create_date,
            size: item.file_size
          };
        })) ||
      [];
  }
}
