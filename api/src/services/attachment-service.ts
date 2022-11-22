import { IDBConnection } from '../database/db';
import {
  AttachmentRepository,
  IGetAttachment,
  IGetAttachmentAuthor,
  IGetAttachmentSecurityReason,
  IGetAttachmentsSource,
  IGetReportAttachmentsSource
} from '../repositories/attachment-repository';
import { DBService } from './db-service';

export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
  }

  async getProjectAttachments(projectId: number): Promise<IGetAttachmentsSource[]> {
    return this.attachmentRepository.getProjectAttachments(projectId);
  }

  async getProjectReportAttachments(projectId: number): Promise<IGetReportAttachmentsSource[]> {
    return this.attachmentRepository.getProjectReportAttachments(projectId);
  }

  async getProjectReportAttachment(projectId: number, attachmentId: number): Promise<IGetAttachment> {
    return this.attachmentRepository.getProjectReportAttachment(projectId, attachmentId);
  }

  async getProjectAttachmentAuthors(attachmentId: number): Promise<IGetAttachmentAuthor[]> {
    return this.attachmentRepository.getProjectAttachmentAuthors(attachmentId);
  }

  async getProjectReportSecurityRules(attachmentId: number): Promise<IGetAttachmentSecurityReason[]> {
    const security_reasons = this.attachmentRepository.getProjectReportSecurityReasons(attachmentId);

    //For faking security reason from the database

    // const security_reasons = [
    //   {
    //     project_report_author_id: 1,
    //     project_report_attachment_id: 2,
    //     persecution_security_id: 3,
    //     update_date: '2022-10-10'
    //   },
    //   {
    //     project_report_author_id: 4,
    //     project_report_attachment_id: 5,
    //     persecution_security_id: 6,
    //     update_date: '2020-12-12'
    //   }
    // ];

    return security_reasons;
  }

  async addSecurityToAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToAttachments(securityIds, attachmentId);
  }

  async addSecurityToReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToReportAttachments(securityIds, attachmentId);
  }

  async addSecurityToAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    const promises = attachmentIds.map((item) => this.addSecurityToAttachment(securityIds, item));

    const results = await Promise.all(promises);

    return results;
  }

  async addSecurityToReportAttachments(securityIds: number[], attachmentIds: number[]): Promise<void[]> {
    const promises = attachmentIds.map((item) => this.addSecurityToReportAttachment(securityIds, item));

    const results = await Promise.all(promises);

    return results;
  }
}
