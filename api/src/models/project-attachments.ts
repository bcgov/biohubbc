import { getLogger } from '../utils/logger';

const defaultLog = getLogger('models/project-attachments');

/**
 * Pre-processes GET project attachments data
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

export interface IReportAttachmentAuthor {
  first_name: string;
  last_name: string;
}

export class PostReportAttachmentMetadata {
  title: string;
  year_published: string;
  authors: IReportAttachmentAuthor[];
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

export class GetReportAttachmentMetadata {
  attachment_id: number;
  title: string;
  last_modified: string;
  description: string;
  year_published: number;
  revision_count: number;
  authors: IReportAttachmentAuthor[];

  constructor(metaObj?: any, authorObj?: any) {
    this.attachment_id = (metaObj && metaObj?.attachment_id) || null;
    this.title = (metaObj && metaObj?.title) || null;
    this.last_modified = (metaObj && metaObj?.update_date) || null;
    this.description = (metaObj && metaObj?.description) || null;
    this.year_published = (metaObj && metaObj?.year) || null;
    this.revision_count = (metaObj && metaObj?.revision_count) || null;
    this.authors =
      (authorObj &&
        authorObj?.map((author: any) => {
          return {
            first_name: author?.first_name,
            last_name: author?.last_name
          };
        })) ||
      [];
  }
}

export class GetReportAttachmentAuthor {
  first_name: string;
  last_name: string;

  constructor(authorObj?: any) {
    this.first_name = (authorObj && authorObj?.first_name) || null;
    this.last_name = (authorObj && authorObj?.last_name) || null;
  }
}
