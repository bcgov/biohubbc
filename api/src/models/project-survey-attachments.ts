import { default as dayjs } from 'dayjs';
import { getLogger } from '../utils/logger';
import { SurveySupplementaryData } from './survey-view';

const defaultLog = getLogger('models/project-survey-attachments');

/**
 * Pre-processes GET project/survey attachments data
 *
 * @export
 * @class GetAttachmentsData
 */
export class GetAttachmentsWithSupplementalData {
  id: number;
  fileName: string;
  fileType: string;
  lastModified: string;
  size: string;
  status: string;
  supplementaryAttachmentData: SurveySupplementaryData;

  constructor(attachment: any, supplementaryData: any) {
    defaultLog.debug({ label: 'GetAttachmentsWithSupplementalData', message: 'params' });

    this.id =
      attachment.survey_attachment_id ||
      attachment.survey_report_attachment_id ||
      attachment.project_attachment_id ||
      attachment.project_report_attachment_id;
    this.fileName = attachment.file_name;
    this.fileType = attachment.file_type || 'Report';
    this.lastModified = dayjs(attachment.update_date || attachment.create_date).toISOString();
    this.size = attachment.file_size;
    this.status = attachment.status;
    this.supplementaryAttachmentData = supplementaryData;
  }
}

export interface IReportAttachmentAuthor {
  first_name: string;
  last_name: string;
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

    this.revision_count = (obj && obj?.revision_count) || 0;
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
    this.last_modified = (metaObj && metaObj?.update_date.toString()) || null;
    this.description = (metaObj && metaObj?.description) || null;
    this.year_published = Number((metaObj && metaObj?.year_published) || null);
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
