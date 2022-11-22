import { IDBConnection } from '../database/db';
import {
  AttachmentRepository,
  IGetAttachmentsSource,
  IGetReportAttachmentsSource
} from '../repositories/attachment-repository';
import { DBService } from './db-service';

export interface IAttachmentType {
  id: number;
  type: 'Report' | 'Other';
}
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

  async addSecurityToAllAttachments(securityIds: number[], attachments: IAttachmentType[]): Promise<void[]> {
    const actions: Promise<void>[] = []
    attachments.forEach(item => {
      if (item.type === 'Report') {
        actions.push(this.addSecurityToReportAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToReportAttachment(item.id));
      } else {
        actions.push(this.addSecurityToAttachment(securityIds, item.id));
        actions.push(this.addSecurityReviewToAttachment(item.id));
      }
    });

    const results = await Promise.all(actions);

    return results;
  }

  async addSecurityReviewToReportAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToReportAttachment(attachmentId);
  }

  async addSecurityReviewToAttachment(attachmentId: number): Promise<void> {
    return this.attachmentRepository.addSecurityReviewTimeToAttachment(attachmentId);
  }
}
