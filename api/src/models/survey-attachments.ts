import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/survey-attachments');

/**
 * Pre-processes GET survey attachments data
 *
 * @export
 * @class GetSurveyAttachmentsData
 */
export class GetSurveyAttachmentsData {
  attachmentsList: any[];

  constructor(attachmentsData?: any) {
    defaultLog.debug({ label: 'GetSurveyAttachmentsData', message: 'params', attachmentsData });

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
