import { IDBConnection } from '../database/db';
import { AttachmentRepository } from '../repositories/attachment-repository';
import { DBService } from './db-service';

export class AttachmentService extends DBService {
  attachmentRepository: AttachmentRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.attachmentRepository = new AttachmentRepository(connection);
  }

  async getProjectAttachments() {
    //
  }

  async getProjectReportAttachments() {
    //
  }
}
