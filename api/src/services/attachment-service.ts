import { IDBConnection } from '../database/db';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { DBService } from './db-service';

export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
  }

  async addSecurityToAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToAttachments(securityIds, attachmentId);
  }

  async addSecurityToReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityToReportAttachments(securityIds, attachmentId);
  }

  async removeSecurityFromReportAttachment(securityIds: number[], attachmentId: number): Promise<void> {
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
