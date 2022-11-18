import moment from 'moment';
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
  reportAttachmentsList: any[];

  constructor(attachmentsData?: any, reportAttachmentsData?: any) {
    defaultLog.debug({ label: 'GetAttachmentsData', message: 'params', attachmentsData });

    const mapAttachment = (item: any) => {
      return {
        id: item.id,
        fileName: item.file_name,
        fileType: item.file_type || 'Report',
        lastModified: moment(item.update_date || item.create_date).toISOString(),
        size: item.file_size,
        securityToken: item.security_token,
        securityReviewTimestamp: item.security_review_timestamp
      };
    }

    this.attachmentsList = attachmentsData?.length && attachmentsData.map(mapAttachment) || [];
    this.reportAttachmentsList = reportAttachmentsData?.length && reportAttachmentsData.map(mapAttachment) || [];
  }
}

export interface IReportAttachmentAuthor {
  first_name: string;
  last_name: string;
}

export interface ISecurityReason {
  category: string;
  sub_category: string;
  reason: string;
  reason_description: string;
  date_expired: string;
}

export class PostReportAttachmentMetadata {
  title: string;
  year_published: number;
  authors: IReportAttachmentAuthor[];
  description: string;

  constructor(obj?: any) {
    this.title = (obj && obj?.title) || null;
    this.year_published = Number((obj && obj?.year_published) || null);
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
  security_review_timestamp: string;
  authors: IReportAttachmentAuthor[];
  security_reasons: ISecurityReason[];

  constructor(metaObj?: any, authorObj?: any, securityObj?: any) {
    this.attachment_id = (metaObj && metaObj?.attachment_id) || null;
    this.title = (metaObj && metaObj?.title) || null;
    this.last_modified = (metaObj && metaObj?.update_date.toString()) || null;
    this.description = (metaObj && metaObj?.description) || null;
    this.year_published = Number((metaObj && metaObj?.year_published) || null);
    this.revision_count = (metaObj && metaObj?.revision_count) || null;
    this.security_review_timestamp = (metaObj && metaObj?.security_review_timestamp) || null;
    this.authors =
      (authorObj &&
        authorObj?.map((author: any) => {
          return {
            first_name: author?.first_name,
            last_name: author?.last_name
          };
        })) ||
      [];
    this.security_reasons =
      (securityObj &&
        securityObj?.map((reason: any) => {
          return {
            category: reason?.category,
            sub_category: reason?.sub_category,
            reason: reason?.reason,
            reason_description: reason?.reason_description,
            date_submitted: this.last_modified
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
