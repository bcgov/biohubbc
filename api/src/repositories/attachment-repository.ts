import { BaseRepository } from './base-repository';

export class AttachmentRepository extends BaseRepository {
  async addSecurityToAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    // TODO
  }

  async addSecurityToReportAttachments(securityIds: number[], attachmentId: number): Promise<void> {
    // TODO
  }
}
