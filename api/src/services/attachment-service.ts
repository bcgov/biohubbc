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
    const response = this.attachmentRepository.getProjectReportAttachment(projectId, attachmentId);

    console.log('getProjectReportAttachment: ', response);
    return response;
  }

  async getProjectAttachmentAuthors(attachmentId: number): Promise<IGetAttachmentAuthor[]> {
    return this.attachmentRepository.getProjectAttachmentAuthors(attachmentId);
  }

  async getProjectAttachmentSecurityRules(attachmentId: number): Promise<IGetAttachmentSecurityReason[]> {
    return this.attachmentRepository.getProjectAttachmentSecurityReasons(attachmentId);
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
