import { IDBConnection } from '../database/db';
import {
    AttachmentRepository,
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
}
