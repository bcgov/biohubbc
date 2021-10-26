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
            fileType: item.file_type || 'Report',
            lastModified: item.update_date || item.create_date,
            size: item.file_size,
            securityToken: item.security_token
          };
        })) ||
      [];
  }
}

export interface ReportAttachmentAuthor {
  first_name: string;
  last_name: string;
}

export class PostReportAttachmentMetadata {
  title: string;
  year_published: string;
  authors: ReportAttachmentAuthor[];
  description: string;

  constructor(obj?: any) {
    this.title = (obj && obj?.title) || null;
    this.year_published = (obj && obj?.year_published) || null;
    this.authors = (obj?.authors?.length && obj.authors) || [];
    this.description = (obj && obj?.description) || null;
  }
}

export class PutReportAttachmentMetadata extends PostReportAttachmentMetadata {
  revision_count: number;

  constructor(obj?: any) {
    super(obj);

    this.revision_count = (obj && obj?.revision_count) || null;
  }
}
